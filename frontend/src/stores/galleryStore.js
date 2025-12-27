// stores/galleryStore.js - Debug version to fix navigation
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

const processImages = (images) => {
  if (!Array.isArray(images)) return [];
  const processed = images.map(img => ({
    ...img,
    imageUrl: getFullImageUrl(img.imageUrl),
    thumbnailUrl: getFullImageUrl(img.thumbnailUrl)
  }));
  console.log('Processed Images:', processed.length, processed);
  return processed;
};

export const useGalleryStore = create(
  devtools(
    persist(
      (set, get) => ({
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
        
        setImages: (images) => {
          const processed = processImages(images);
          console.log('Setting images in store:', processed.length);
          set({ images: processed });
        },
        
        setSelectedImage: (image) => {
          console.log('Setting selected image:', image?._id || image?.id);
          set({ 
            selectedImage: image ? {
              ...image,
              imageUrl: getFullImageUrl(image.imageUrl),
              thumbnailUrl: getFullImageUrl(image.thumbnailUrl)
            } : null 
          });
        },
        
        setLayout: (layout) => set({ layout }),
        setSearchTerm: (term) => set({ searchTerm: term, page: 1 }),
        setFilterTags: (tags) => set({ filterTags: tags, page: 1 }),
        setPage: (page) => set({ page }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        
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
            
            console.log('Fetching images with params:', params.toString());
            const { data } = await api.get(`/images?${params}`);
            console.log('Raw API response:', data);
            
            const processedImages = processImages(data.data || []);
            console.log('After processing:', processedImages.length, 'images');
            
            set({
              images: processedImages,
              totalImages: data.pagination?.total || 0,
              totalPages: data.pagination?.pages || 0,
              isLoading: false
            });
            
            return processedImages;
          } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch images';
            console.error('Fetch error:', errorMessage);
            set({ 
              error: errorMessage,
              isLoading: false,
              images: []
            });
            throw error;
          }
        },
        
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
        
        updateImage: async (imageId, updates) => {
          set({ isLoading: true, error: null });
          
          try {
            const { data } = await api.put(`/images/${imageId}`, updates);
            
            const processedImage = {
              ...data.data,
              imageUrl: getFullImageUrl(data.data.imageUrl),
              thumbnailUrl: getFullImageUrl(data.data.thumbnailUrl)
            };
            
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
        
        deleteImage: async (imageId) => {
          set({ isLoading: true, error: null });
          
          try {
            await api.delete(`/images/${imageId}`);
            
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
        
        likeImage: async (imageId, increment = true) => {
          try {
            const { data } = await api.post(`/images/${imageId}/like`, { increment });
            
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
        
        bulkUpdatePositions: async (positions) => {
          try {
            const { data } = await api.put('/images/positions/bulk', { positions });
            
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
        
        searchImages: async (searchTerm) => {
          set({ searchTerm, page: 1 });
          return get().fetchImages();
        },
        
        clearError: () => set({ error: null }),
        
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