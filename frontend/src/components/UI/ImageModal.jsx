import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Download, Share2, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

const ImageModal = ({ image, onClose, onNext, onPrev, isMobile }) => {
  const modalRef = useRef();
  const imageRef = useRef();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [onNext, onPrev]);

  useEffect(() => {
    if (!imageRef.current) return;

    gsap.killTweensOf(imageRef.current);

    gsap.fromTo(
      imageRef.current,
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  }, [image?.id]);

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `${image.title.replace(/\s+/g, '-')}.jpg`;
    link.click();
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!image) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70"
        onClick={onClose}
      >
        {/* Close button */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 sm:p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-10 backdrop-blur-md shadow-lg"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </motion.button>

        {/* Navigation buttons - Hidden on mobile */}
        {!isMobile && onPrev && (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-10 backdrop-blur-md shadow-lg"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </motion.button>
        )}

        {!isMobile && onNext && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-10 backdrop-blur-md shadow-lg"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </motion.button>
        )}

        {/* Main content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl" // Increased max-width
        >
          {/* Image section */}
          <div className="relative rounded-lg sm:rounded-2xl p-1.5 sm:p-3 bg-transparent border border-white/10 shadow-2xl">
            <div
              className="relative w-full flex items-center justify-center overflow-hidden bg-black rounded-lg"
              style={{ height: isMobile ? '50vh' : '65vh' }}
            >
              <img
                key={image.id}
                ref={imageRef}
                src={image.imageUrl}
                alt={image.title}
                className="max-h-full max-w-full object-contain rounded-lg"
                style={{
                  opacity: 1,
                  filter: 'none',
                  backgroundColor: 'black',
                  boxShadow: '0 0 40px rgba(0,0,0,0.35)'
                }}
              />
            </div>
            
            {/* Action buttons */}
            <motion.div 
              className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex justify-start gap-2 sm:gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="p-2 sm:p-3 bg-white/15 hover:bg-white/25 border border-white/30 rounded-full backdrop-blur-md transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <Download className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </motion.button>
              
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-2 sm:p-3 bg-white/15 hover:bg-white/25 border border-white/30 rounded-full backdrop-blur-md transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <Share2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </motion.button>
            </motion.div>

            {/* Mobile Navigation Buttons */}
            {isMobile && (
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2">
                {onPrev && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </motion.button>
                )}
                {onNext && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Details section - SIGNIFICANTLY INCREASED FONT SIZES HERE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-2 sm:mt-4 bg-black/70 rounded-lg sm:rounded-2xl p-3 sm:p-6 backdrop-blur-md border border-white/15 shadow-2xl max-h-[30vh] sm:max-h-none overflow-y-auto custom-scrollbar"
          >
            {/* Title - Bigger on Laptop */}
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
              {image.title}
            </h2>

            {/* Description - Bigger on Laptop */}
            <p className="text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base md:text-xl">
              {image.description}
            </p>

            {/* Metadata - Bigger on Laptop */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-white/5 border border-white/10">
                <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
                <span className="truncate">{formatDate(image.createdAt)}</span>
              </div>

              {image.metadata?.width && image.metadata?.height && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-white/5 border border-white/10">
                  <ZoomIn className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-400 flex-shrink-0" />
                  <span className="font-mono text-xs sm:text-sm md:text-base">
                    {image.metadata.width} × {image.metadata.height}
                  </span>
                </div>
              )}
            </div>

            {/* Tags - Bigger on Laptop */}
            {image.tags && image.tags.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                  <Tag className="w-3.5 h-3.5 md:w-5 md:h-5 text-yellow-400" />
                  <span className="text-gray-400 text-xs sm:text-sm md:text-base uppercase tracking-wide">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + (0.05 * index), type: "spring" }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="px-3 py-1 md:px-4 md:py-1.5 bg-white/10 text-white rounded-full text-xs sm:text-sm md:text-base border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all cursor-default"
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical details - Bigger on Laptop */}
            {image.metadata && (
              <div className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  Technical Details
                </h3>
                <div className="grid grid-cols-3 gap-3 text-xs sm:text-sm md:text-base text-gray-300">
                  <div className="flex flex-col">
                    <span className="text-gray-500 mb-1">Format</span>
                    <span className="font-mono font-bold text-white">{image.metadata.format?.toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 mb-1">Size</span>
                    <span className="font-mono font-bold text-white">
                      {(image.metadata.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 mb-1">Ratio</span>
                    <span className="font-mono font-bold text-white">
                      {(image.metadata.width / image.metadata.height).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;