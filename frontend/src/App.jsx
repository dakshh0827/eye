// stores/galleryStore.js - Zustand Store for Gallery State
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance with config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
        setImages: (images) => set({ images }),
        
        setSelectedImage: (image) => set({ selectedImage: image }),
        
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
              page,
              limit,
              ...(searchTerm && { search: searchTerm }),
              ...(filterTags.length > 0 && { tags: filterTags.join(',') })
            });
            
            const { data } = await api.get(`/images?${params}`);
            
            set({
              images: data.data,
              totalImages: data.pagination.total,
              totalPages: data.pagination.pages,
              isLoading: false
            });
            
            return data.data;
          } catch (error) {
            set({ 
              error: error.response?.data?.message || error.message,
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Fetch single image
        fetchImage: async (imageId) => {
          set({ isLoading: true, error: null });
          
          try {
            const { data } = await api.get(`/images/${imageId}`);
            set({ selectedImage: data.data, isLoading: false });
            return data.data;
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
            set({ isLoading: false });
            return data.data;
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
            
            // Add new image to the list
            set((state) => ({
              images: [data.data, ...state.images],
              totalImages: state.totalImages + 1,
              isLoading: false
            }));
            
            return data.data;
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
            
            // Update image in the list
            set((state) => ({
              images: state.images.map(img => 
                img.id === imageId ? data.data : img
              ),
              selectedImage: state.selectedImage?.id === imageId 
                ? data.data 
                : state.selectedImage,
              isLoading: false
            }));
            
            return data.data;
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
              images: state.images.filter(img => img.id !== imageId),
              totalImages: state.totalImages - 1,
              selectedImage: state.selectedImage?.id === imageId 
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
                img.id === imageId 
                  ? { ...img, likes: data.data.likes }
                  : img
              ),
              selectedImage: state.selectedImage?.id === imageId
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
                const update = positions.find(p => p.id === img.id);
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