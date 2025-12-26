// stores/galleryStore.js - Fixed Zustand Store with proper image URL handling
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import axios from 'axios';

// Use Vite environment variable - FIXED: Added backend base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Axios instance with config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Helper function to get full image URL
const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

// Helper function to process images with full URLs
const processImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images.map(img => ({
    ...img,
    imageUrl: getFullImageUrl(img.imageUrl),
    thumbnailUrl: getFullImageUrl(img.thumbnailUrl)
  }));
};

// Gallery Store
export const useGalleryStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        images: [],
        selectedImage: null,
        layout: 'spiral',
        searchTerm: '',
        filterTags: [],
        page: 1,
        limit: 50,
        totalImages: 0,
        totalPages: 0,
        isLoading: false,
        error: null,
        
        // Actions
        setImages: (images) => set({ images: processImages(images) }),
        
        setSelectedImage: (image) => set({ 
          selectedImage: image ? {
            ...image,
            imageUrl: getFullImageUrl(image.imageUrl),
            thumbnailUrl: getFullImageUrl(image.thumbnailUrl)
          } : null 
        }),
        
        setLayout: (layout) => set({ layout }),
        
        setSearchTerm: (term) => set({ searchTerm: term, page: 1 }),
        
        setFilterTags: (tags) => set({ filterTags: tags, page: 1 }),
        
        setPage: (page) => set({ page }),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error }),
        
        // Fetch images
        fetchImages: async () => {
          const { page, limit, searchTerm, filterTags } = get();
          
          set({ isLoading: true, error: null });
          
          try {
            const params = new URLSearchParams({
              page: page.toString(),
              limit: limit.toString(),
              ...(searchTerm && { search: searchTerm }),
              ...(filterTags.length > 0 && { tags: filterTags.join(',') })
            });
            
            const { data } = await api.get(`/images?${params}`);
            
            const processedImages = processImages(data.data || []);
            
            set({
              images: processedImages,
              totalImages: data.pagination?.total || 0,
              totalPages: data.pagination?.pages || 0,
              isLoading: false
            });
            
            return processedImages;
          } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch images';
            set({ 
              error: errorMessage,
              isLoading: false,
              images: []
            });
            throw error;
          }
        },
        
        // Fetch single image
        fetchImage: async (imageId) => {
          set({ isLoading: true, error: null });
          
          try {
            const { data } = await api.get(`/images/${imageId}`);
            const processedImage = {
              ...data.data,
              imageUrl: getFullImageUrl(data.data.imageUrl),
              thumbnailUrl: getFullImageUrl(data.data.thumbnailUrl)
            };
            set({ selectedImage: processedImage, isLoading: false });
            return processedImage;
          } catch (error) {
            set({ 
              error: error.response?.data?.message || error.message,
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Fetch trending images
        fetchTrending: async (limit = 10) => {
          set({ isLoading: true, error: null });
          
          try {
            const { data } = await api.get(`/images/trending?limit=${limit}`);
            const processed = processImages(data.data);
            set({ isLoading: false });
            return processed;
          } catch (error) {
            set({ 
              error: error.response?.data?.message || error.message,
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Upload image
        uploadImage: async (formData) => {
          set({ isLoading: true, error: null });
          
          try {
            const { data } = await api.post('/images', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            const processedImage = {
              ...data.data,
              imageUrl: getFullImageUrl(data.data.imageUrl),
              thumbnailUrl: getFullImageUrl(data.data.thumbnailUrl)
            };
            
            // Add new image to the list
            set((state) => ({
              images: [processedImage, ...state.images],
              totalImages: state.totalImages + 1,
              isLoading: false
            }));
            
            return processedImage;
          } catch (error) {
            set({ 
              error: error.response?.data?.message || error.message,
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Update image
        updateImage: async (imageId, updates) => {
          set({ isLoading: true, error: null });
          
          try {
            const { data } = await api.put(`/images/${imageId}`, updates);
            
            const processedImage = {
              ...data.data,
              imageUrl: getFullImageUrl(data.data.imageUrl),
              thumbnailUrl: getFullImageUrl(data.data.thumbnailUrl)
            };
            
            // Update image in the list
            set((state) => ({
              images: state.images.map(img => 
                img._id === imageId ? processedImage : img
              ),
              selectedImage: state.selectedImage?._id === imageId 
                ? processedImage 
                : state.selectedImage,
              isLoading: false
            }));
            
            return processedImage;
          } catch (error) {
            set({ 
              error: error.response?.data?.message || error.message,
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Delete image
        deleteImage: async (imageId) => {
          set({ isLoading: true, error: null });
          
          try {
            await api.delete(`/images/${imageId}`);
            
            // Remove image from the list
            set((state) => ({
              images: state.images.filter(img => img._id !== imageId),
              totalImages: state.totalImages - 1,
              selectedImage: state.selectedImage?._id === imageId 
                ? null 
                : state.selectedImage,
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error.response?.data?.message || error.message,
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Like image
        likeImage: async (imageId, increment = true) => {
          try {
            const { data } = await api.post(`/images/${imageId}/like`, { increment });
            
            // Update likes in the list
            set((state) => ({
              images: state.images.map(img =>
                img._id === imageId 
                  ? { ...img, likes: data.data.likes }
                  : img
              ),
              selectedImage: state.selectedImage?._id === imageId
                ? { ...state.selectedImage, likes: data.data.likes }
                : state.selectedImage
            }));
            
            return data.data.likes;
          } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            throw error;
          }
        },
        
        // Bulk update positions
        bulkUpdatePositions: async (positions) => {
          try {
            const { data } = await api.put('/images/positions/bulk', { positions });
            
            // Update positions in the store
            set((state) => ({
              images: state.images.map(img => {
                const update = positions.find(p => p.id === img._id);
                return update ? { ...img, position3D: update.position3D } : img;
              })
            }));
            
            return data;
          } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            throw error;
          }
        },
        
        // Search images
        searchImages: async (searchTerm) => {
          set({ searchTerm, page: 1 });
          return get().fetchImages();
        },
        
        // Clear error
        clearError: () => set({ error: null }),
        
        // Reset store
        reset: () => set({
          images: [],
          selectedImage: null,
          searchTerm: '',
          filterTags: [],
          page: 1,
          error: null
        })
      }),
      {
        name: 'gallery-storage',
        partialize: (state) => ({ 
          layout: state.layout,
          filterTags: state.filterTags
        })
      }
    ),
    { name: 'GalleryStore' }
  )
);

// Selectors (for better performance)
export const selectImages = (state) => state.images;
export const selectSelectedImage = (state) => state.selectedImage;
export const selectLayout = (state) => state.layout;
export const selectIsLoading = (state) => state.isLoading;
export const selectError = (state) => state.error;
export const selectPagination = (state) => ({
  page: state.page,
  totalPages: state.totalPages,
  totalImages: state.totalImages
});