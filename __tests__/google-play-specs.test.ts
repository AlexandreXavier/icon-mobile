import {
  GOOGLE_PLAY_ASSETS,
  ASSET_CATEGORIES,
  getAssetsByCategory,
  AssetSpec,
  AssetCategory,
} from '@/lib/google-play-specs';

describe('Google Play Specs', () => {
  describe('GOOGLE_PLAY_ASSETS', () => {
    it('should have a non-empty array of assets', () => {
      expect(GOOGLE_PLAY_ASSETS).toBeDefined();
      expect(Array.isArray(GOOGLE_PLAY_ASSETS)).toBe(true);
      expect(GOOGLE_PLAY_ASSETS.length).toBeGreaterThan(0);
    });

    it('should have valid asset specs', () => {
      GOOGLE_PLAY_ASSETS.forEach((asset: AssetSpec) => {
        expect(asset.name).toBeDefined();
        expect(typeof asset.name).toBe('string');
        expect(asset.name.length).toBeGreaterThan(0);

        expect(asset.width).toBeDefined();
        expect(typeof asset.width).toBe('number');
        expect(asset.width).toBeGreaterThan(0);

        expect(asset.height).toBeDefined();
        expect(typeof asset.height).toBe('number');
        expect(asset.height).toBeGreaterThan(0);

        expect(asset.category).toBeDefined();
        expect(['icon', 'feature', 'screenshot', 'splash', 'tv']).toContain(
          asset.category
        );

        expect(asset.format).toBeDefined();
        expect(['png', 'jpeg']).toContain(asset.format);

        expect(asset.description).toBeDefined();
        expect(typeof asset.description).toBe('string');

        expect(asset.folder).toBeDefined();
        expect(typeof asset.folder).toBe('string');
      });
    });

    it('should include the 512x512 Play Store app icon', () => {
      const playStoreIcon = GOOGLE_PLAY_ASSETS.find(
        (asset) => asset.name === 'app-icon-512'
      );
      expect(playStoreIcon).toBeDefined();
      expect(playStoreIcon?.width).toBe(512);
      expect(playStoreIcon?.height).toBe(512);
      expect(playStoreIcon?.category).toBe('icon');
      expect(playStoreIcon?.format).toBe('png');
    });

    it('should include the feature graphic', () => {
      const featureGraphic = GOOGLE_PLAY_ASSETS.find(
        (asset) => asset.name === 'feature-graphic'
      );
      expect(featureGraphic).toBeDefined();
      expect(featureGraphic?.width).toBe(1024);
      expect(featureGraphic?.height).toBe(500);
      expect(featureGraphic?.category).toBe('feature');
    });

    it('should include launcher icons for all DPI levels', () => {
      const dpiLevels = ['xxxhdpi', 'xxhdpi', 'xhdpi', 'hdpi', 'mdpi', 'ldpi'];
      dpiLevels.forEach((dpi) => {
        const icon = GOOGLE_PLAY_ASSETS.find(
          (asset) => asset.name === `launcher-icon-${dpi}`
        );
        expect(icon).toBeDefined();
        expect(icon?.category).toBe('icon');
      });
    });

    it('should include splash screens for various DPI levels', () => {
      const splashDpis = ['xxxhdpi', 'xxhdpi', 'xhdpi', 'hdpi', 'mdpi'];
      splashDpis.forEach((dpi) => {
        const splash = GOOGLE_PLAY_ASSETS.find(
          (asset) => asset.name === `splash-${dpi}`
        );
        expect(splash).toBeDefined();
        expect(splash?.category).toBe('splash');
      });
    });
  });

  describe('ASSET_CATEGORIES', () => {
    it('should have all expected categories', () => {
      const expectedCategories: AssetCategory[] = [
        'icon',
        'feature',
        'screenshot',
        'splash',
        'tv',
      ];
      expectedCategories.forEach((category) => {
        expect(ASSET_CATEGORIES[category]).toBeDefined();
        expect(ASSET_CATEGORIES[category].label).toBeDefined();
        expect(ASSET_CATEGORIES[category].description).toBeDefined();
      });
    });

    it('should have proper labels and descriptions', () => {
      Object.values(ASSET_CATEGORIES).forEach((category) => {
        expect(typeof category.label).toBe('string');
        expect(category.label.length).toBeGreaterThan(0);
        expect(typeof category.description).toBe('string');
        expect(category.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getAssetsByCategory', () => {
    it('should return only assets of the specified category', () => {
      const categories: AssetCategory[] = [
        'icon',
        'feature',
        'screenshot',
        'splash',
        'tv',
      ];
      categories.forEach((category) => {
        const assets = getAssetsByCategory(category);
        expect(Array.isArray(assets)).toBe(true);
        assets.forEach((asset) => {
          expect(asset.category).toBe(category);
        });
      });
    });

    it('should return correct number of icon assets', () => {
      const icons = getAssetsByCategory('icon');
      expect(icons.length).toBeGreaterThanOrEqual(7); // At least 7 icons (512 + 6 DPI levels + adaptive)
    });

    it('should return at least one feature graphic', () => {
      const features = getAssetsByCategory('feature');
      expect(features.length).toBeGreaterThanOrEqual(1);
    });

    it('should return splash screens', () => {
      const splashes = getAssetsByCategory('splash');
      expect(splashes.length).toBeGreaterThanOrEqual(5);
    });
  });
});
