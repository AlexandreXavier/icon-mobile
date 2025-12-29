import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import JSZip from 'jszip';
import { GOOGLE_PLAY_ASSETS, AssetSpec, AssetCategory } from '@/lib/google-play-specs';

interface ConvertedAsset {
  name: string;
  folder: string;
  buffer: Buffer;
  format: 'png' | 'jpeg';
}

async function processImage(
  imageBuffer: Buffer,
  spec: AssetSpec,
  backgroundColor: string
): Promise<ConvertedAsset> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image: could not read dimensions');
  }

  // Calculate resizing strategy
  // For icons and splash screens, we need to fit the image properly
  let processedImage: sharp.Sharp;

  if (spec.category === 'icon') {
    // For icons, resize to fit within bounds and add padding if needed
    processedImage = sharp(imageBuffer)
      .resize(spec.width, spec.height, {
        fit: 'contain',
        background: backgroundColor,
      });
  } else if (spec.category === 'splash') {
    // For splash screens, center the image with the background color
    const scaleFactor = Math.min(
      spec.width / metadata.width,
      spec.height / metadata.height,
      1
    );
    const newWidth = Math.round(metadata.width * scaleFactor * 0.6); // 60% of available space
    const newHeight = Math.round(metadata.height * scaleFactor * 0.6);

    processedImage = sharp({
      create: {
        width: spec.width,
        height: spec.height,
        channels: 4,
        background: backgroundColor,
      },
    }).composite([
      {
        input: await sharp(imageBuffer)
          .resize(newWidth, newHeight, { fit: 'inside' })
          .toBuffer(),
        gravity: 'center',
      },
    ]);
  } else {
    // For other types (feature graphics, screenshots), cover the area
    processedImage = sharp(imageBuffer)
      .resize(spec.width, spec.height, {
        fit: 'cover',
        position: 'center',
      });
  }

  // Output in the specified format
  let outputBuffer: Buffer;
  if (spec.format === 'jpeg') {
    outputBuffer = await processedImage.jpeg({ quality: 90 }).toBuffer();
  } else {
    outputBuffer = await processedImage.png().toBuffer();
  }

  const filename = `${spec.name}.${spec.format}`;

  return {
    name: filename,
    folder: spec.folder,
    buffer: outputBuffer,
    format: spec.format,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const categoriesParam = formData.get('categories') as string | null;
    const backgroundColor = (formData.get('backgroundColor') as string) || '#ffffff';

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PNG, JPEG, WebP, or GIF.' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Determine which categories to process
    let selectedCategories: AssetCategory[] = ['icon', 'feature', 'screenshot', 'splash', 'tv'];
    if (categoriesParam) {
      try {
        selectedCategories = JSON.parse(categoriesParam);
      } catch {
        // Use default categories if parsing fails
      }
    }

    // Filter assets by selected categories
    const assetsToProcess = GOOGLE_PLAY_ASSETS.filter((asset) =>
      selectedCategories.includes(asset.category)
    );

    // Process all assets
    const zip = new JSZip();
    const results: { name: string; success: boolean; error?: string }[] = [];

    for (const spec of assetsToProcess) {
      try {
        const asset = await processImage(imageBuffer, spec, backgroundColor);
        zip.file(`${asset.folder}/${asset.name}`, asset.buffer);
        results.push({ name: spec.name, success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ name: spec.name, success: false, error: errorMessage });
      }
    }

    // Generate ZIP file as Blob for NextResponse compatibility
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // Return the ZIP file
    return new NextResponse(zipBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="google-play-assets.zip"',
        'X-Conversion-Results': JSON.stringify(results),
      },
    });
  } catch (error) {
    console.error('Image conversion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to process image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
