import Database from 'better-sqlite3';
import { AdsService } from '../../src/modules/ads/ads.service';
import { setupTestDatabase, clearTestData, createTestAd, createTestVote } from '../setup';
import { AppError } from '../../src/middleware/errorHandler';

// Mock the database module
jest.mock('../../src/config/database', () => ({
  db: {} as Database.Database
}));

describe('AdsService', () => {
  let testDb: Database.Database;
  let adsService: AdsService;

  beforeAll(() => {
    testDb = setupTestDatabase();
    // Replace the db import with our test database
    const dbModule = require('../../src/config/database');
    dbModule.db = testDb;
    adsService = new AdsService();
  });

  beforeEach(() => {
    clearTestData(testDb);
  });

  afterAll(() => {
    testDb.close();
  });

  describe('createAd', () => {
    it('should create a new ad with valid YouTube URL', () => {
      const adData = {
        title: 'Test Ad',
        description: 'Test Description',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        brand: 'Test Brand',
        category: 'Technology'
      };

      const ad = adsService.createAd(adData);

      expect(ad).toBeDefined();
      expect(ad.title).toBe('Test Ad');
      expect(ad.description).toBe('Test Description');
      expect(ad.video_platform).toBe('youtube');
      expect(ad.video_id).toBe('dQw4w9WgXcQ');
      expect(ad.brand).toBe('Test Brand');
      expect(ad.category).toBe('Technology');
      expect(ad.status).toBe('active');
      expect(ad.total_votes).toBe(0);
      expect(ad.average_rating).toBe(0);
    });

    it('should create a new ad with valid Vimeo URL', () => {
      const adData = {
        title: 'Vimeo Test Ad',
        video_url: 'https://vimeo.com/123456789',
        brand: 'Vimeo Brand'
      };

      const ad = adsService.createAd(adData);

      expect(ad).toBeDefined();
      expect(ad.title).toBe('Vimeo Test Ad');
      expect(ad.video_platform).toBe('vimeo');
      expect(ad.video_id).toBe('123456789');
    });

    it('should throw error with invalid video URL', () => {
      const adData = {
        title: 'Invalid Ad',
        video_url: 'https://invalid.com/video'
      };

      expect(() => adsService.createAd(adData)).toThrow(AppError);
      expect(() => adsService.createAd(adData)).toThrow('Invalid video URL');
    });

    it('should create ad without optional fields', () => {
      const adData = {
        title: 'Minimal Ad',
        video_url: 'https://www.youtube.com/watch?v=abc123def45'
      };

      const ad = adsService.createAd(adData);

      expect(ad).toBeDefined();
      expect(ad.title).toBe('Minimal Ad');
      expect(ad.description).toBeNull();
      expect(ad.brand).toBeNull();
      expect(ad.category).toBeNull();
    });
  });

  describe('getAdById', () => {
    it('should retrieve an existing ad', () => {
      const testAd = createTestAd(testDb, { title: 'Find Me' });

      const ad = adsService.getAdById(testAd.id);

      expect(ad).toBeDefined();
      expect(ad?.id).toBe(testAd.id);
      expect(ad?.title).toBe('Find Me');
    });

    it('should return null for non-existent ad', () => {
      const ad = adsService.getAdById('non-existent-id');

      expect(ad).toBeNull();
    });
  });

  describe('getAllAds', () => {
    beforeEach(() => {
      createTestAd(testDb, { title: 'Ad 1', category: 'Tech', brand: 'Brand A', status: 'active' });
      createTestAd(testDb, { title: 'Ad 2', category: 'Fashion', brand: 'Brand B', status: 'active' });
      createTestAd(testDb, { title: 'Ad 3', category: 'Tech', brand: 'Brand A', status: 'inactive' });
    });

    it('should retrieve all ads without filters', () => {
      const ads = adsService.getAllAds();

      expect(ads).toHaveLength(3);
    });

    it('should filter ads by status', () => {
      const ads = adsService.getAllAds({ status: 'active' });

      expect(ads).toHaveLength(2);
      expect(ads.every(ad => ad.status === 'active')).toBe(true);
    });

    it('should filter ads by category', () => {
      const ads = adsService.getAllAds({ category: 'Tech' });

      expect(ads).toHaveLength(2);
      expect(ads.every(ad => ad.category === 'Tech')).toBe(true);
    });

    it('should filter ads by brand', () => {
      const ads = adsService.getAllAds({ brand: 'Brand A' });

      expect(ads).toHaveLength(2);
      expect(ads.every(ad => ad.brand === 'Brand A')).toBe(true);
    });

    it('should search ads by text', () => {
      const ads = adsService.getAllAds({ search: 'Ad 2' });

      expect(ads).toHaveLength(1);
      expect(ads[0].title).toBe('Ad 2');
    });

    it('should combine multiple filters', () => {
      const ads = adsService.getAllAds({ status: 'active', category: 'Tech' });

      expect(ads).toHaveLength(1);
      expect(ads[0].title).toBe('Ad 1');
    });
  });

  describe('updateAd', () => {
    it('should update ad title', () => {
      const testAd = createTestAd(testDb, { title: 'Original Title' });

      const updatedAd = adsService.updateAd(testAd.id, { title: 'Updated Title' });

      expect(updatedAd.title).toBe('Updated Title');
    });

    it('should update ad description', () => {
      const testAd = createTestAd(testDb, { description: 'Original' });

      const updatedAd = adsService.updateAd(testAd.id, { description: 'Updated' });

      expect(updatedAd.description).toBe('Updated');
    });

    it('should update ad status', () => {
      const testAd = createTestAd(testDb, { status: 'active' });

      const updatedAd = adsService.updateAd(testAd.id, { status: 'inactive' });

      expect(updatedAd.status).toBe('inactive');
    });

    it('should update video URL', () => {
      const testAd = createTestAd(testDb);

      const updatedAd = adsService.updateAd(testAd.id, {
        video_url: 'https://vimeo.com/987654321'
      });

      expect(updatedAd.video_platform).toBe('vimeo');
      expect(updatedAd.video_id).toBe('987654321');
    });

    it('should throw error for invalid video URL during update', () => {
      const testAd = createTestAd(testDb);

      expect(() =>
        adsService.updateAd(testAd.id, { video_url: 'https://invalid.com/video' })
      ).toThrow(AppError);
    });

    it('should throw error when updating non-existent ad', () => {
      expect(() =>
        adsService.updateAd('non-existent-id', { title: 'New Title' })
      ).toThrow(AppError);
      expect(() =>
        adsService.updateAd('non-existent-id', { title: 'New Title' })
      ).toThrow('Ad not found');
    });

    it('should return unchanged ad when no updates provided', () => {
      const testAd = createTestAd(testDb, { title: 'Original' });

      const updatedAd = adsService.updateAd(testAd.id, {});

      expect(updatedAd.title).toBe('Original');
    });
  });

  describe('deleteAd', () => {
    it('should delete an existing ad', () => {
      const testAd = createTestAd(testDb);

      adsService.deleteAd(testAd.id);

      const ad = adsService.getAdById(testAd.id);
      expect(ad).toBeNull();
    });

    it('should throw error when deleting non-existent ad', () => {
      expect(() => adsService.deleteAd('non-existent-id')).toThrow(AppError);
      expect(() => adsService.deleteAd('non-existent-id')).toThrow('Ad not found');
    });

    it('should cascade delete votes when ad is deleted', () => {
      const testAd = createTestAd(testDb);
      createTestVote(testDb, { ad_id: testAd.id, rating: 5 });

      adsService.deleteAd(testAd.id);

      const votes = testDb.prepare('SELECT * FROM votes WHERE ad_id = ?').all(testAd.id);
      expect(votes).toHaveLength(0);
    });
  });

  describe('getTopRatedAds', () => {
    beforeEach(() => {
      const ad1 = createTestAd(testDb, { title: 'Ad 1' });
      const ad2 = createTestAd(testDb, { title: 'Ad 2' });
      const ad3 = createTestAd(testDb, { title: 'Ad 3' });

      // Ad 1: 5 stars average
      createTestVote(testDb, { ad_id: ad1.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad1.id, rating: 5 });

      // Ad 2: 4 stars average
      createTestVote(testDb, { ad_id: ad2.id, rating: 4 });
      createTestVote(testDb, { ad_id: ad2.id, rating: 4 });

      // Ad 3: 3 stars average
      createTestVote(testDb, { ad_id: ad3.id, rating: 3 });

      // Update ratings
      adsService.updateAdRating(ad1.id, 5);
      adsService.updateAdRating(ad1.id, 5);
      adsService.updateAdRating(ad2.id, 4);
      adsService.updateAdRating(ad2.id, 4);
      adsService.updateAdRating(ad3.id, 3);
    });

    it('should return ads sorted by rating', () => {
      const topAds = adsService.getTopRatedAds(10);

      expect(topAds.length).toBeGreaterThan(0);
      expect(topAds[0].title).toBe('Ad 1');
    });

    it('should respect the limit parameter', () => {
      const topAds = adsService.getTopRatedAds(2);

      expect(topAds).toHaveLength(2);
    });

    it('should only return active ads with votes', () => {
      createTestAd(testDb, { title: 'No Votes', status: 'active' });

      const topAds = adsService.getTopRatedAds(10);

      expect(topAds.every(ad => ad.total_votes > 0)).toBe(true);
      expect(topAds.every(ad => ad.status === 'active')).toBe(true);
    });
  });

  describe('getTrendingAds', () => {
    it('should return ads with recent votes', () => {
      const ad1 = createTestAd(testDb, { title: 'Trending Ad' });
      createTestVote(testDb, { ad_id: ad1.id, rating: 5 });

      const trendingAds = adsService.getTrendingAds(10);

      expect(trendingAds.length).toBeGreaterThan(0);
    });

    it('should respect the limit parameter', () => {
      const ad1 = createTestAd(testDb, { title: 'Ad 1' });
      const ad2 = createTestAd(testDb, { title: 'Ad 2' });
      createTestVote(testDb, { ad_id: ad1.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad2.id, rating: 4 });

      const trendingAds = adsService.getTrendingAds(1);

      expect(trendingAds).toHaveLength(1);
    });
  });

  describe('getAdsByCategory', () => {
    beforeEach(() => {
      createTestAd(testDb, { title: 'Tech Ad 1', category: 'Technology', status: 'active' });
      createTestAd(testDb, { title: 'Tech Ad 2', category: 'Technology', status: 'active' });
      createTestAd(testDb, { title: 'Fashion Ad', category: 'Fashion', status: 'active' });
      createTestAd(testDb, { title: 'Inactive Tech', category: 'Technology', status: 'inactive' });
    });

    it('should return only active ads in specified category', () => {
      const ads = adsService.getAdsByCategory('Technology');

      expect(ads).toHaveLength(2);
      expect(ads.every(ad => ad.category === 'Technology')).toBe(true);
      expect(ads.every(ad => ad.status === 'active')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const ads = adsService.getAdsByCategory('NonExistent');

      expect(ads).toHaveLength(0);
    });
  });

  describe('getCategories', () => {
    beforeEach(() => {
      createTestAd(testDb, { category: 'Technology', status: 'active' });
      createTestAd(testDb, { category: 'Fashion', status: 'active' });
      createTestAd(testDb, { category: 'Technology', status: 'active' });
      createTestAd(testDb, { category: 'Sports', status: 'inactive' });
      createTestAd(testDb, { category: null, status: 'active' });
    });

    it('should return unique categories from active ads', () => {
      const categories = adsService.getCategories();

      expect(categories).toContain('Technology');
      expect(categories).toContain('Fashion');
      expect(categories).not.toContain('Sports'); // inactive
      expect(categories).not.toContain(null);
    });

    it('should return sorted categories', () => {
      const categories = adsService.getCategories();

      const sorted = [...categories].sort();
      expect(categories).toEqual(sorted);
    });
  });

  describe('updateAdRating', () => {
    it('should update ad rating statistics after vote', () => {
      const ad = createTestAd(testDb);
      createTestVote(testDb, { ad_id: ad.id, rating: 4 });

      adsService.updateAdRating(ad.id, 4);

      const updatedAd = adsService.getAdById(ad.id);
      expect(updatedAd?.total_votes).toBe(1);
      expect(updatedAd?.average_rating).toBe(4);
    });

    it('should calculate correct average with multiple votes', () => {
      const ad = createTestAd(testDb);
      createTestVote(testDb, { ad_id: ad.id, rating: 5 });
      createTestVote(testDb, { ad_id: ad.id, rating: 3 });

      adsService.updateAdRating(ad.id, 5);
      adsService.updateAdRating(ad.id, 3);

      const updatedAd = adsService.getAdById(ad.id);
      expect(updatedAd?.total_votes).toBe(2);
      expect(updatedAd?.average_rating).toBe(4); // (5 + 3) / 2 = 4
    });
  });
});
