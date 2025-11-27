import { Request, Response } from 'express';
import adsService from './ads.service';
import { CreateAdDTO, UpdateAdDTO, AdFilters } from './ads.types';
import { AppError } from '../../middleware/errorHandler';

export class AdsController {
  /**
   * GET /api/ads
   * Get all ads with optional filters
   */
  async getAllAds(req: Request, res: Response): Promise<void> {
    try {
      const filters: AdFilters = {
        status: req.query.status as any,
        category: req.query.category as string,
        brand: req.query.brand as string,
        search: req.query.search as string
      };

      const ads = adsService.getAllAds(filters);

      res.json({
        success: true,
        count: ads.length,
        data: ads
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/ads/:id
   * Get a single ad by ID
   */
  async getAdById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const ad = adsService.getAdById(id);

      if (!ad) {
        throw new AppError('Ad not found', 404);
      }

      res.json({
        success: true,
        data: ad
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/ads
   * Create a new ad
   */
  async createAd(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateAdDTO = req.body;

      if (!data.title || !data.video_url) {
        throw new AppError('Title and video URL are required', 400);
      }

      const ad = adsService.createAd(data);

      res.status(201).json({
        success: true,
        message: 'Ad created successfully',
        data: ad
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /api/ads/:id
   * Update an existing ad
   */
  async updateAd(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateAdDTO = req.body;

      const ad = adsService.updateAd(id, data);

      res.json({
        success: true,
        message: 'Ad updated successfully',
        data: ad
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/ads/:id
   * Delete an ad
   */
  async deleteAd(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      adsService.deleteAd(id);

      res.json({
        success: true,
        message: 'Ad deleted successfully'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/ads/top-rated
   * Get top-rated ads
   */
  async getTopRatedAds(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const ads = adsService.getTopRatedAds(limit);

      res.json({
        success: true,
        count: ads.length,
        data: ads
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/ads/trending
   * Get trending ads
   */
  async getTrendingAds(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const ads = adsService.getTrendingAds(limit);

      res.json({
        success: true,
        count: ads.length,
        data: ads
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/ads/categories
   * Get all unique categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = adsService.getCategories();

      res.json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/ads/category/:category
   * Get ads by category
   */
  async getAdsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const ads = adsService.getAdsByCategory(category);

      res.json({
        success: true,
        count: ads.length,
        data: ads
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new AdsController();
