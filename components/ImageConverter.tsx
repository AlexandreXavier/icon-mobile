'use client';

import { useState, useCallback, useRef } from 'react';
import { ASSET_CATEGORIES, AssetCategory, getAssetsByCategory } from '@/lib/google-play-specs';

interface ConversionResult {
  name: string;
  success: boolean;
  error?: string;
}

type ConversionStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<AssetCategory[]>([
    'icon',
    'feature',
    'splash',
  ]);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (PNG, JPEG, WebP, or GIF)');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File size exceeds 50MB limit');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResults([]);
    setStatus('idle');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  const toggleCategory = useCallback((category: AssetCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one asset category');
      return;
    }

    setStatus('processing');
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('categories', JSON.stringify(selectedCategories));
      formData.append('backgroundColor', backgroundColor);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      // Get results from header
      const resultsHeader = response.headers.get('X-Conversion-Results');
      if (resultsHeader) {
        setResults(JSON.parse(resultsHeader));
      }

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'google-play-assets.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setResults([]);
    setStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  return (
    <div className="w-full max-w-4xl space-y-8">
      {/* Upload Area */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        data-testid="drop-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleInputChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          data-testid="file-input"
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 max-w-full rounded-lg shadow-lg"
                data-testid="image-preview"
              />
              <button
                onClick={clearSelection}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/80"
                data-testid="clear-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedFile?.name} ({(selectedFile?.size ?? 0 / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mb-4 h-12 w-12 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-lg font-medium">
              Drop your image here or click to browse
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Supports PNG, JPEG, WebP, and GIF (max 50MB)
            </p>
          </>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Asset Categories</h3>
          <div className="space-y-2">
            {(Object.keys(ASSET_CATEGORIES) as AssetCategory[]).map((category) => {
              const assetCount = getAssetsByCategory(category).length;
              return (
                <label
                  key={category}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 rounded border-border"
                    data-testid={`category-${category}`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      {ASSET_CATEGORIES[category].label}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({assetCount} files)
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ASSET_CATEGORIES[category].description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Background Color</h3>
          <p className="text-sm text-muted-foreground">
            Used for padding icons and splash screen backgrounds
          </p>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-12 w-12 cursor-pointer rounded-lg border border-border"
              data-testid="color-picker"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2"
              placeholder="#ffffff"
              data-testid="color-input"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['#ffffff', '#000000', '#4285f4', '#34a853', '#ea4335', '#fbbc05'].map(
              (color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className="h-8 w-8 rounded-full border border-border transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  aria-label={`Set color to ${color}`}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          data-testid="error-message"
        >
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4" data-testid="results">
          <h3 className="mb-3 font-semibold">Conversion Results</h3>
          <p className="text-sm">
            <span className="text-green-600 dark:text-green-400">
              {successCount} successful
            </span>
            {failureCount > 0 && (
              <span className="ml-3 text-destructive">
                {failureCount} failed
              </span>
            )}
          </p>
          {failureCount > 0 && (
            <div className="mt-3 space-y-1">
              {results
                .filter((r) => !r.success)
                .map((r) => (
                  <p key={r.name} className="text-sm text-destructive">
                    {r.name}: {r.error}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!selectedFile || status === 'processing'}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="convert-button"
      >
        {status === 'processing' ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : status === 'success' ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            Downloaded! Convert Again
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Convert & Download
          </>
        )}
      </button>
    </div>
  );
}
