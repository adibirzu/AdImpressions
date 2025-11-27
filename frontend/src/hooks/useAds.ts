import { useState, useEffect } from 'react';
import { Ad, AdFilters, PaginatedResponse } from '../types';
import adsService from '../services/adsService';

export const useAds = (filters?: AdFilters) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 12,
    total_pages: 0,
  });

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<Ad> = await adsService.getAds(filters);
      setAds(response.items);
      setPagination({
        total: response.total,
        page: response.page,
        page_size: response.page_size,
        total_pages: response.total_pages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [
    filters?.sort_by,
    filters?.filter_by,
    filters?.industry,
    filters?.brand,
    filters?.search,
    filters?.page,
  ]);

  const refetch = () => {
    fetchAds();
  };

  return {
    ads,
    loading,
    error,
    pagination,
    refetch,
  };
};

export const useAd = (id: string) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAd = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adsService.getAdById(id);
      setAd(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAd();
    }
  }, [id]);

  const refetch = () => {
    fetchAd();
  };

  return {
    ad,
    loading,
    error,
    refetch,
  };
};

export default useAds;
