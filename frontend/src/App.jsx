import React, { useEffect, useState } from 'react';
import Scene3D from './components/Gallery/Scene3D';
import Navigation from './components/UI/Navigation';
import ImageModal from './components/UI/ImageModal';
import UploadModal from './components/UI/UploadModal';
import LoadingScreen from './components/UI/LoadingScreen';
import { useGalleryStore } from './stores/galleryStore';

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get state and actions from Zustand store
  const images = useGalleryStore(state => state.images);
  const selectedImage = useGalleryStore(state => state.selectedImage);
  const layout = useGalleryStore(state => state.layout);
  const error = useGalleryStore(state => state.error);
  const totalImages = useGalleryStore(state => state.totalImages);
  
  const fetchImages = useGalleryStore(state => state.fetchImages);
  const setSelectedImage = useGalleryStore(state => state.setSelectedImage);
  const setLayout = useGalleryStore(state => state.setLayout);
  const searchImages = useGalleryStore(state => state.searchImages);
  const likeImage = useGalleryStore(state => state.likeImage);
  const clearError = useGalleryStore(state => state.clearError);

  // Detect mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch images on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        await fetchImages();
        setLayout('web');
        setTimeout(() => setIsInitialLoad(false), 1500);
      } catch (err) {
        console.error('Failed to load images:', err);
        setIsInitialLoad(false);
      }
    };
    loadImages();
  }, [fetchImages, setLayout]);

  // Handlers
  const handleImageClick = (image) => setSelectedImage(image);
  const handleModalClose = () => setSelectedImage(null);
  const handleLayoutChange = (newLayout) => setLayout(newLayout);
  
  const handleSearch = async (searchTerm) => {
    try {
      await searchImages(searchTerm);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleLike = async (imageId) => {
    try {
      await likeImage(imageId, true);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleNext = () => {
    if (!selectedImage || !images || images.length === 0) return;
    
    const currentIndex = images.findIndex(img => 
      (img._id && img._id === selectedImage._id) || 
      (img.id && img.id === selectedImage.id)
    );
    
    if (currentIndex === -1) {
      setSelectedImage(images[0]);
      return;
    }
    
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedImage || !images || images.length === 0) return;
    
    const currentIndex = images.findIndex(img => 
      (img._id && img._id === selectedImage._id) || 
      (img.id && img.id === selectedImage.id)
    );
    
    if (currentIndex === -1) {
      setSelectedImage(images[images.length - 1]);
      return;
    }
    
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  if (isInitialLoad) return <LoadingScreen />;

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <Navigation
        onLayoutChange={handleLayoutChange}
        currentLayout={layout}
        onSearch={handleSearch}
        totalImages={totalImages}
        onUpload={() => setIsUploadOpen(true)}
        isMobile={isMobile}
      />

      {/* Error Toast - Responsive */}
      {error && (
        <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-40 bg-red-900/80 border border-red-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg backdrop-blur-md flex items-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(239,68,68,0.5)] max-w-[90vw] text-sm sm:text-base">
          <span>⚠️ {error}</span>
          <button onClick={clearError} className="hover:text-red-300 px-2">✕</button>
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
            isMobile={isMobile}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white px-4">
            <div className="w-16 h-16 sm:w-24 sm:h-24 border border-white/20 bg-white/5 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <span className="text-2xl sm:text-4xl">🌌</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider mb-2 text-center">UNIVERSE EMPTY</h2>
            <p className="text-gray-500 mb-4 sm:mb-6 font-mono text-xs sm:text-sm text-center">Initiate sequence: Upload Image</p>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-light tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm sm:text-base"
            >
              UPLOAD
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
          isMobile={isMobile}
        />
      )}

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)}
        isMobile={isMobile}
      />

      {/* Instructions Overlay - UPDATED TEXT SIZE */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none px-4">
        <div className="bg-black/40 border border-white/10 text-white/60 px-5 sm:px-8 py-2 sm:py-3 rounded-full backdrop-blur-sm text-sm sm:text-base md:text-lg lg:text-xl tracking-widest uppercase text-center">
          With Love ❤️
        </div>
      </div>
    </div>
  );
}

export default App;