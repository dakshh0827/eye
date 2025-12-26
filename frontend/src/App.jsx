// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import Scene3D from './components/Gallery/Scene3D';
import Navigation from './components/UI/Navigation';
import ImageModal from './components/UI/ImageModal';
import UploadModal from './components/UI/UploadModal'; // Import the new modal
import LoadingScreen from './components/UI/LoadingScreen';
import { useGalleryStore } from './stores/galleryStore';

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false); // New state for upload modal

  // Get state and actions from Zustand store
  const images = useGalleryStore(state => state.images);
  const selectedImage = useGalleryStore(state => state.selectedImage);
  const layout = useGalleryStore(state => state.layout);
  const isLoading = useGalleryStore(state => state.isLoading);
  const error = useGalleryStore(state => state.error);
  const totalImages = useGalleryStore(state => state.totalImages);
  
  const fetchImages = useGalleryStore(state => state.fetchImages);
  const setSelectedImage = useGalleryStore(state => state.setSelectedImage);
  const setLayout = useGalleryStore(state => state.setLayout);
  const searchImages = useGalleryStore(state => state.searchImages);
  const likeImage = useGalleryStore(state => state.likeImage);
  const clearError = useGalleryStore(state => state.clearError);

  // Fetch images on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        await fetchImages();
        setTimeout(() => setIsInitialLoad(false), 1500);
      } catch (err) {
        console.error('Failed to load images:', err);
        setIsInitialLoad(false);
      }
    };
    loadImages();
  }, [fetchImages]);

  // Handlers
  const handleImageClick = (image) => setSelectedImage(image);
  const handleModalClose = () => setSelectedImage(null);
  const handleLayoutChange = (newLayout) => setLayout(newLayout);
  
  // Search Handler
  const handleSearch = async (searchTerm) => {
    try {
      await searchImages(searchTerm);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Like Handler
  const handleLike = async (imageId) => {
    try {
      await likeImage(imageId, true);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  // Modal Navigation
  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img._id === selectedImage._id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img._id === selectedImage._id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  if (isInitialLoad) return <LoadingScreen />;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 overflow-hidden">
      <Navigation
        onLayoutChange={handleLayoutChange}
        currentLayout={layout}
        onSearch={handleSearch}
        totalImages={totalImages}
        onUpload={() => setIsUploadOpen(true)} // Pass upload handler
      />

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-red-500/90 text-white px-6 py-3 rounded-lg backdrop-blur-md flex items-center gap-3 shadow-lg">
          <span>⚠️ {error}</span>
          <button onClick={clearError} className="hover:bg-white/20 px-2 rounded">✕</button>
        </div>
      )}

      {/* 3D Scene */}
      <div className="w-full h-full pt-0">
        {images.length > 0 ? (
          <Scene3D
            images={images}
            onImageClick={handleImageClick}
            selectedImage={selectedImage}
            layout={layout}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">📷</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Gallery is Empty</h2>
            <p className="text-gray-400 mb-6">Upload your first image to create the 3D space</p>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
            >
              Upload Now
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={handleModalClose}
          onNext={images.length > 1 ? handleNext : null}
          onPrev={images.length > 1 ? handlePrev : null}
          onLike={handleLike}
        />
      )}

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />

      {/* Instructions Overlay */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur-md text-sm pointer-events-none">
        🖱️ Drag to orbit • 🖱️ Scroll to zoom • 👆 Click images to view
      </div>
    </div>
  );
}

export default App;