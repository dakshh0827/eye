// hooks/useGalleryData.js - Custom Hook for Gallery Data
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance with config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch all images with pagination
 */
export const useImages = (params = {}) => {
  const { page = 1, limit = 20, sort = '-createdAt', tags, search } = params;
  
  return useQuery(
    ['images', { page, limit, sort, tags, search }],
    async () => {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sort,
        ...(tags && { tags }),
        ...(search && { search })
      });
      
      const { data } = await api.get(`/images?${queryParams}`);
      return data;
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

/**
 * Fetch single image by ID
 */
export const useImage = (imageId) => {
  return useQuery(
    ['image', imageId],
    async () => {
      const { data } = await api.get(`/images/${imageId}`);
      return data.data;
    },
    {
      enabled: !!imageId,
      staleTime: 5 * 60 * 1000,
    }
  );
};

/**
 * Fetch trending images
 */
export const useTrendingImages = (limit = 10) => {
  return useQuery(
    ['trending', limit],
    async () => {
      const { data } = await api.get(`/images/trending?limit=${limit}`);
      return data.data;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

/**
 * Upload new image
 */
export const useUploadImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (formData) => {
      const { data } = await api.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    },
    {
      onSuccess: () => {
        // Invalidate and refetch images list
        queryClient.invalidateQueries('images');
      },
    }
  );
};

/**
 * Update image metadata
 */
export const useUpdateImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ imageId, updates }) => {
      const { data } = await api.put(`/images/${imageId}`, updates);
      return data;
    },
    {
      onSuccess: (data, variables) => {
        // Update cache for this specific image
        queryClient.invalidateQueries(['image', variables.imageId]);
        queryClient.invalidateQueries('images');
      },
    }
  );
};

/**
 * Delete image
 */
export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (imageId) => {
      const { data } = await api.delete(`/images/${imageId}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );
};

/**
 * Toggle like on image
 */
export const useLikeImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ imageId, increment = true }) => {
      const { data } = await api.post(`/images/${imageId}/like`, { increment });
      return data;
    },
    {
      onSuccess: (data, variables) => {
        // Optimistically update the cache
        queryClient.setQueryData(['image', variables.imageId], (old) => {
          if (!old) return old;
          return {
            ...old,
            likes: data.data.likes
          };
        });
        
        // Update in images list cache
        queryClient.setQueriesData('images', (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map(img => 
              img._id === variables.imageId 
                ? { ...img, likes: data.data.likes }
                : img
            )
          };
        });
      },
    }
  );
};

/**
 * Bulk update positions (for layout changes)
 */
export const useBulkUpdatePositions = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (positions) => {
      const { data } = await api.put('/images/positions/bulk', { positions });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );
};

/**
 * Search images
 */
export const useSearchImages = (searchTerm, enabled = true) => {
  return useQuery(
    ['images', 'search', searchTerm],
    async () => {
      const { data } = await api.get(`/images?search=${searchTerm}`);
      return data.data;
    },
    {
      enabled: enabled && searchTerm.length > 2,
      staleTime: 30 * 1000, // 30 seconds
    }
  );
};

export default {
  useImages,
  useImage,
  useTrendingImages,
  useUploadImage,
  useUpdateImage,
  useDeleteImage,
  useLikeImage,
  useBulkUpdatePositions,
  useSearchImages
};