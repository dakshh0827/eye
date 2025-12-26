// App.jsx - Main Application Component with Zustand State Management
import React, { useEffect, useState } from 'react';
import Scene3D from './components/Gallery/Scene3D';
import Navigation from './components/UI/Navigation';
import ImageModal from './components/UI/ImageModal';
import LoadingScreen from './components/UI/LoadingScreen';
import { useGalleryStore } from './stores/galleryStore';

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
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
        // Simulate loading for better UX
        setTimeout(() => {
          setIsInitialLoad(false);
        }, 1500);
      } catch (err) {
        console.error('Failed to load images:', err);
        setIsInitialLoad(false);
      }
    };

    loadImages();
  }, [fetchImages]);

  // Handle image click
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedImage(null);
  };

  // Handle layout change
  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  // Handle search
  const handleSearch = async (searchTerm) => {
    try {
      await searchImages(searchTerm);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Handle like
  const handleLike = async (imageId) => {
    try {
      await likeImage(imageId, true);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  // Handle navigation in modal
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

  // Show initial loading screen
  if (isInitialLoad) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 overflow-hidden">
      {/* Navigation Bar */}
      <Navigation
        onLayoutChange={handleLayoutChange}
        currentLayout={layout}
        onSearch={handleSearch}
        totalImages={totalImages}
      />

      {/* Error Display */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-red-500/90 text-white px-6 py-3 rounded-lg backdrop-blur-md flex items-center gap-3">
          <span>⚠️ {error}</span>
          <button
            onClick={clearError}
            className="ml-2 hover:bg-red-600 px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && !isInitialLoad && (
        <div className="fixed top-20 right-6 z-40 bg-blue-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-md">
          Loading...
        </div>
      )}

      {/* 3D Scene */}
      <div className="w-full h-full pt-20">
        {images.length > 0 ? (
          <Scene3D
            images={images}
            onImageClick={handleImageClick}
            selectedImage={selectedImage}
            layout={layout}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-4xl">📷</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Images Yet</h2>
              <p className="text-gray-400">Upload some images to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={handleModalClose}
          onNext={images.length > 1 ? handleNext : null}
          onPrev={images.length > 1 ? handlePrev : null}
          onLike={handleLike}
        />
      )}

      {/* Instructions overlay (dismissible) */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur-md text-sm">
        🖱️ Drag to orbit • 🖱️ Scroll to zoom • 👆 Click images to view
      </div>
    </div>
  );
}

export default App;