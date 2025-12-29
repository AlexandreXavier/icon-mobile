'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageEdits {
  crop: Crop;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  resize: {
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
  backgroundRemoved: boolean;
}

interface ImageEditorProps {
  imageUrl: string;
  originalFile: File;
  onImageEdited: (editedFile: File) => void;
  onCancel: () => void;
}

export function ImageEditor({ imageUrl, originalFile, onImageEdited, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [edits, setEdits] = useState<ImageEdits>({
    crop: { unit: '%', width: 50, height: 50, x: 25, y: 25 },
    rotation: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    resize: { width: 0, height: 0, maintainAspectRatio: true },
    backgroundRemoved: false,
  });
  const [activeTab, setActiveTab] = useState<'crop' | 'rotate' | 'color' | 'resize' | 'exposure' | 'background'>('crop');
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setEdits(prev => ({
        ...prev,
        resize: { width: img.width, height: img.height, maintainAspectRatio: true }
      }));
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const applyEdits = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = image.width;
    canvas.height = image.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply rotation
    if (edits.rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((edits.rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Apply color adjustments
    ctx.filter = `
      brightness(${100 + edits.brightness}%)
      contrast(${100 + edits.contrast}%)
      saturate(${100 + edits.saturation}%)
    `;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Restore context state
    ctx.restore();
  }, [image, edits]);

  useEffect(() => {
    if (image && canvasRef.current) {
      applyEdits();
    }
  }, [image, edits, applyEdits]);

  const handleCropChange = (crop: Crop) => {
    setEdits(prev => ({ ...prev, crop }));
  };

  const handleCropComplete = (crop: PixelCrop) => {
    setCompletedCrop(crop);
  };

  const applyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
  }, [completedCrop]);

  const setAspectRatio = (ratio: number | null) => {
    setEdits(prev => ({
      ...prev,
      crop: {
        ...prev.crop,
        aspectRatio: ratio || undefined
      }
    }));
  };

  const rotate = (angle: number) => {
    setEdits(prev => ({ ...prev, rotation: prev.rotation + angle }));
  };

  const resetRotation = () => {
    setEdits(prev => ({ ...prev, rotation: 0 }));
  };

  const adjustColor = (property: 'brightness' | 'contrast' | 'saturation', value: number) => {
    setEdits(prev => ({ ...prev, [property]: value }));
  };

  const resize = (width: number, height: number) => {
    setEdits(prev => ({
      ...prev,
      resize: { ...prev.resize, width, height }
    }));
  };

  const applyResize = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = edits.resize;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
  };

  const adjustExposure = (value: number) => {
    setEdits(prev => ({ ...prev, exposure: value }));
  };

  const removeBackground = async () => {
    setEdits(prev => ({ ...prev, backgroundRemoved: true }));
  };

  const resetAll = () => {
    if (!image) return;

    setEdits({
      crop: { unit: '%', width: 50, height: 50, x: 25, y: 25 },
      rotation: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      resize: { width: image.width, height: image.height, maintainAspectRatio: true },
      backgroundRemoved: false,
    });
  };

  const applyEditsAndSave = async () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const editedFile = new File([blob], originalFile.name, {
          type: originalFile.type,
          lastModified: Date.now(),
        });
        onImageEdited(editedFile);
      }
    }, originalFile.type);
  };

  if (!image) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Image</h2>
        <div className="flex gap-2">
          <button
            onClick={resetAll}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
          >
            Reset All
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={applyEditsAndSave}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Apply & Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas/Image */}
        <div className="lg:col-span-3">
          <div className="bg-muted rounded-lg p-4 overflow-auto">
            {activeTab === 'crop' ? (
              <ReactCrop
                crop={edits.crop}
                onChange={handleCropChange}
                onComplete={handleCropComplete}
                aspect={edits.crop.aspectRatio}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Edit"
                  className="max-w-full h-auto"
                />
              </ReactCrop>
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-border"
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'crop', label: 'Crop' },
              { id: 'rotate', label: 'Rotate' },
              { id: 'color', label: 'Color' },
              { id: 'resize', label: 'Resize' },
              { id: 'exposure', label: 'Exposure' },
              { id: 'background', label: 'Background' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-muted rounded-lg p-4">
            {activeTab === 'crop' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Crop</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Drag the corners to adjust crop area
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm">Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setAspectRatio(null)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent"
                      >
                        Free
                      </button>
                      <button
                        onClick={() => setAspectRatio(1)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent"
                      >
                        1:1
                      </button>
                      <button
                        onClick={() => setAspectRatio(16/9)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent"
                      >
                        16:9
                      </button>
                      <button
                        onClick={() => setAspectRatio(4/3)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent"
                      >
                        4:3
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={applyCrop}
                    className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'rotate' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Rotate</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => rotate(-90)}
                      className="px-3 py-2 text-sm bg-background border border-border rounded hover:bg-accent"
                    >
                      ← 90°
                    </button>
                    <button
                      onClick={() => rotate(90)}
                      className="px-3 py-2 text-sm bg-background border border-border rounded hover:bg-accent"
                    >
                      90° →
                    </button>
                    <button
                      onClick={() => rotate(-180)}
                      className="px-3 py-2 text-sm bg-background border border-border rounded hover:bg-accent"
                    >
                      ← 180°
                    </button>
                    <button
                      onClick={resetRotation}
                      className="px-3 py-2 text-sm bg-background border border-border rounded hover:bg-accent"
                    >
                      Reset
                    </button>
                  </div>
                  <div>
                    <label className="text-sm">Custom Angle: {edits.rotation}°</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={edits.rotation}
                      onChange={(e) => setEdits(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'color' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Color Adjustments</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm">Brightness: {edits.brightness}%</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={edits.brightness}
                      onChange={(e) => adjustColor('brightness', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Contrast: {edits.contrast}%</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={edits.contrast}
                      onChange={(e) => adjustColor('contrast', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Saturation: {edits.saturation}%</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={edits.saturation}
                      onChange={(e) => adjustColor('saturation', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resize' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Resize</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm">Width (px)</label>
                      <input
                        type="number"
                        value={edits.resize.width}
                        onChange={(e) => resize(Number(e.target.value), edits.resize.height)}
                        className="w-full px-2 py-1 text-sm border border-border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-sm">Height (px)</label>
                      <input
                        type="number"
                        value={edits.resize.height}
                        onChange={(e) => resize(edits.resize.width, Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-border rounded"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="maintain-aspect"
                      checked={edits.resize.maintainAspectRatio}
                      onChange={(e) => setEdits(prev => ({
                        ...prev,
                        resize: { ...prev.resize, maintainAspectRatio: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <label htmlFor="maintain-aspect" className="text-sm">
                      Maintain aspect ratio
                    </label>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Presets:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => resize(512, 512)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent"
                      >
                        512×512
                      </button>
                      <button
                        onClick={() => resize(1024, 1024)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent"
                      >
                        1024×1024
                      </button>
                      <button
                        onClick={() => resize(1920, 1080)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent"
                      >
                        1920×1080
                      </button>
                      <button
                        onClick={() => resize(1080, 1920)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent"
                      >
                        1080×1920
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={applyResize}
                    className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Apply Resize
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'exposure' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Exposure</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm">Exposure: {edits.exposure}%</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={edits.exposure}
                      onChange={(e) => adjustExposure(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adjust the overall exposure of the image
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Background Removal</h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Remove the background from your image
                  </p>
                  <button
                    onClick={removeBackground}
                    disabled={edits.backgroundRemoved}
                    className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                  >
                    {edits.backgroundRemoved ? 'Background Removed' : 'Remove Background'}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Note: This is a demo implementation. In production, integrate with a background removal service.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
