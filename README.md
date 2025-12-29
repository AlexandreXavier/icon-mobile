# Google Play Asset Generator

A web application that automatically converts and exports app assets in the exact formats, aspect ratios, and file sizes mandated by Google Play Store.

## Features

- **Image Upload**: Drag & drop or click-to-browse interface supporting PNG, JPEG, WebP, and GIF formats (up to 50MB)
- **Automatic Asset Generation**: Creates 17+ Google Play compliant assets including:
  - App icons (512x512 Play Store icon + 6 DPI launcher icons)
  - Feature graphic (1024x500)
  - Splash screens (5 sizes from mdpi to xxxhdpi)
  - Screenshots (phone, 7" tablet, 10" tablet)
  - TV banner (1280x720)
  - Adaptive icon foreground
- **Dark Mode**: Toggle with system preference detection and localStorage persistence
- **Custom Background Colors**: Color picker for icon padding and splash screen backgrounds
- **ZIP Download**: All assets organized in folders for easy submission

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS
- **Image Processing**: Sharp
- **Testing**: Jest with React Testing Library
- **Icons**: Lucide React

## Getting Started

First, install dependencies:

```bash
pnpm install
# or
npm install
# or
yarn install
```

Then run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to use the app.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run test suite
- `pnpm lint` - Run ESLint

## Project Structure

```
├── app/
│   ├── api/convert/          # Image processing API endpoint
│   ├── page.tsx             # Main application page
│   └── layout.tsx           # Root layout with theme provider
├── components/
│   ├── ImageConverter.tsx   # Main upload/convert UI component
│   ├── ThemeProvider.tsx    # Dark mode context provider
│   └── ThemeToggle.tsx      # Theme switch button
├── lib/
│   └── google-play-specs.ts # Google Play asset specifications
└── __tests__/               # Test files
```

## How It Works

1. Upload an image using the drag & drop zone
2. Select custom background colors (optional)
3. The app automatically generates all required Google Play assets
4. Download the complete ZIP file with organized folders

## Testing

The app includes comprehensive tests covering:
- Google Play specifications validation
- Theme toggle functionality
- Image converter component behavior
- API endpoint functionality

Run tests with:

```bash
pnpm test
```

## Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
