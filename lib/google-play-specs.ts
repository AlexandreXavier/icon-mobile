export interface AssetSpec {
  name: string;
  width: number;
  height: number;
  category: 'icon' | 'feature' | 'screenshot' | 'splash' | 'tv';
  format: 'png' | 'jpeg';
  description: string;
  folder: string;
}

export const GOOGLE_PLAY_ASSETS: AssetSpec[] = [
  // App Icons
  {
    name: 'app-icon-512',
    width: 512,
    height: 512,
    category: 'icon',
    format: 'png',
    description: 'Play Store App Icon',
    folder: 'icons',
  },
  {
    name: 'launcher-icon-xxxhdpi',
    width: 192,
    height: 192,
    category: 'icon',
    format: 'png',
    description: 'Launcher Icon (xxxhdpi)',
    folder: 'icons/android',
  },
  {
    name: 'launcher-icon-xxhdpi',
    width: 144,
    height: 144,
    category: 'icon',
    format: 'png',
    description: 'Launcher Icon (xxhdpi)',
    folder: 'icons/android',
  },
  {
    name: 'launcher-icon-xhdpi',
    width: 96,
    height: 96,
    category: 'icon',
    format: 'png',
    description: 'Launcher Icon (xhdpi)',
    folder: 'icons/android',
  },
  {
    name: 'launcher-icon-hdpi',
    width: 72,
    height: 72,
    category: 'icon',
    format: 'png',
    description: 'Launcher Icon (hdpi)',
    folder: 'icons/android',
  },
  {
    name: 'launcher-icon-mdpi',
    width: 48,
    height: 48,
    category: 'icon',
    format: 'png',
    description: 'Launcher Icon (mdpi)',
    folder: 'icons/android',
  },
  {
    name: 'launcher-icon-ldpi',
    width: 36,
    height: 36,
    category: 'icon',
    format: 'png',
    description: 'Launcher Icon (ldpi)',
    folder: 'icons/android',
  },

  // Feature Graphic
  {
    name: 'feature-graphic',
    width: 1024,
    height: 500,
    category: 'feature',
    format: 'png',
    description: 'Feature Graphic (Play Store banner)',
    folder: 'marketing',
  },

  // TV Assets
  {
    name: 'tv-banner',
    width: 1280,
    height: 720,
    category: 'tv',
    format: 'png',
    description: 'TV Banner',
    folder: 'tv',
  },

  // Phone Screenshots (Portrait 9:16)
  {
    name: 'phone-screenshot-1080x1920',
    width: 1080,
    height: 1920,
    category: 'screenshot',
    format: 'png',
    description: 'Phone Screenshot (1080x1920)',
    folder: 'screenshots/phone',
  },

  // Tablet Screenshots (Landscape 16:10)
  {
    name: 'tablet-7-screenshot-1280x800',
    width: 1280,
    height: 800,
    category: 'screenshot',
    format: 'png',
    description: '7-inch Tablet Screenshot',
    folder: 'screenshots/tablet-7',
  },
  {
    name: 'tablet-10-screenshot-2560x1600',
    width: 2560,
    height: 1600,
    category: 'screenshot',
    format: 'png',
    description: '10-inch Tablet Screenshot',
    folder: 'screenshots/tablet-10',
  },

  // Splash Screens (Portrait)
  {
    name: 'splash-xxxhdpi',
    width: 1242,
    height: 2688,
    category: 'splash',
    format: 'png',
    description: 'Splash Screen (xxxhdpi)',
    folder: 'splash',
  },
  {
    name: 'splash-xxhdpi',
    width: 1080,
    height: 1920,
    category: 'splash',
    format: 'png',
    description: 'Splash Screen (xxhdpi)',
    folder: 'splash',
  },
  {
    name: 'splash-xhdpi',
    width: 720,
    height: 1280,
    category: 'splash',
    format: 'png',
    description: 'Splash Screen (xhdpi)',
    folder: 'splash',
  },
  {
    name: 'splash-hdpi',
    width: 480,
    height: 800,
    category: 'splash',
    format: 'png',
    description: 'Splash Screen (hdpi)',
    folder: 'splash',
  },
  {
    name: 'splash-mdpi',
    width: 320,
    height: 480,
    category: 'splash',
    format: 'png',
    description: 'Splash Screen (mdpi)',
    folder: 'splash',
  },

  // Adaptive Icon Foreground/Background (Android 8+)
  {
    name: 'adaptive-icon-foreground',
    width: 432,
    height: 432,
    category: 'icon',
    format: 'png',
    description: 'Adaptive Icon Foreground Layer',
    folder: 'icons/adaptive',
  },
];

export const ASSET_CATEGORIES = {
  icon: {
    label: 'App Icons',
    description: 'App launcher icons for various Android DPI levels',
  },
  feature: {
    label: 'Feature Graphics',
    description: 'Promotional banners displayed on Play Store',
  },
  screenshot: {
    label: 'Screenshots',
    description: 'App screenshots for different device types',
  },
  splash: {
    label: 'Splash Screens',
    description: 'Loading splash screens for various screen sizes',
  },
  tv: {
    label: 'TV Assets',
    description: 'Assets for Android TV applications',
  },
} as const;

export type AssetCategory = keyof typeof ASSET_CATEGORIES;

export function getAssetsByCategory(category: AssetCategory): AssetSpec[] {
  return GOOGLE_PLAY_ASSETS.filter((asset) => asset.category === category);
}
