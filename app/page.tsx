import { ImageConverter } from "@/components/ImageConverter";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6 text-primary-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold">Google Play Asset Generator</h1>
              <p className="text-sm text-muted-foreground">
                Icons & Splash Screens
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight">
            Convert Your Image to Google Play Assets
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Upload a single high-resolution image and automatically generate all the
            icons, feature graphics, and splash screens required by Google Play Store.
          </p>
        </div>

        <div className="flex justify-center">
          <ImageConverter />
        </div>

        {/* Features Section */}
        <section className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Multiple DPI Sizes</h3>
            <p className="text-muted-foreground">
              Automatically generates icons for all Android DPI levels: mdpi, hdpi, xhdpi, xxhdpi, and xxxhdpi.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Google Play Ready</h3>
            <p className="text-muted-foreground">
              All assets meet exact Google Play Store requirements including correct dimensions, formats, and file sizes.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Organized ZIP Export</h3>
            <p className="text-muted-foreground">
              Download all generated assets in a neatly organized ZIP file with folders for each category.
            </p>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="mt-16">
          <h3 className="mb-6 text-center text-2xl font-bold">Generated Assets</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-semibold">App Icons</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                512x512 Play Store icon, plus launcher icons for all DPI levels
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-semibold">Feature Graphic</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                1024x500 promotional banner for Play Store listing
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-semibold">Splash Screens</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Multiple sizes from 320x480 to 1242x2688 for all devices
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-semibold">Screenshots</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Phone, 7-inch tablet, and 10-inch tablet sizes
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>Google Play Asset Generator - Convert images to all required formats</p>
        </div>
      </footer>
    </div>
  );
}
