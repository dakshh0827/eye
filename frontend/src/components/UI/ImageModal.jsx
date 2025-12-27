// components/UI/ImageModal.jsx - FULLY FIXED: Maximum image clarity and proper navigation
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Download, Share2, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

const ImageModal = ({ image, onClose, onNext, onPrev }) => {
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
        initial={ false }
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
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
          className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-10 backdrop-blur-md shadow-lg"
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>

        {/* Navigation buttons */}
        {onPrev && (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-10 backdrop-blur-md shadow-lg"
          >
            <motion.div
              whileHover={{ x: -3 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.div>
          </motion.button>
        )}

        {onNext && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-10 backdrop-blur-md shadow-lg"
          >
            <motion.div
              whileHover={{ x: 3 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.div>
          </motion.button>
        )}

        {/* Main content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl"
        >
          {/* MAXIMUM CLARITY: Image section with minimal interference */}
            <div className="relative rounded-2xl p-3 bg-transparent border border-white/10 shadow-2xl">
            {/* Pure image display - no overlays */}
            <div
              className="relative w-full flex items-center justify-center overflow-hidden bg-black"
              style={{ height: '67vh' }}
            >
              <img
                key={image.id}
                ref={imageRef}
                src={image.imageUrl}
                alt={image.title}
                className="max-h-full max-w-full object-contain rounded-xl"
                style={{
                  opacity: 1,
                  filter: 'none',
                  backgroundColor: 'black',
                  boxShadow: '0 0 40px rgba(0,0,0,0.35)'
                }}
              />
            </div>
            
            {/* Action buttons overlay - back at bottom */}
            <motion.div 
              className="absolute bottom-6 left-6 right-6 flex justify-start gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="p-3 bg-white/15 hover:bg-white/25 border border-white/30 rounded-full backdrop-blur-md transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <motion.div
                  variants={{
                    hover: { y: -3 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Download className="w-5 h-5 text-white" />
                </motion.div>
              </motion.button>
              
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-3 bg-white/15 hover:bg-white/25 border border-white/30 rounded-full backdrop-blur-md transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <motion.div
                  variants={{
                    hover: { rotate: 15 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Share2 className="w-5 h-5 text-white" />
                </motion.div>
              </motion.button>
            </motion.div>
          </div>

          {/* Compact details section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-4 bg-black/70 rounded-2xl p-5 backdrop-blur-md border border-white/15 shadow-2xl"
          >
            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-2 leading-tight">
              {image.title}
            </h2>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed mb-3 text-sm">
              {image.description}
            </p>

            {/* Metadata in single row */}
            <div className="flex flex-wrap gap-3 mb-3 text-xs">
              {/* Date */}
              <div className="flex items-center gap-2 text-gray-300 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{formatDate(image.createdAt)}</span>
              </div>

              {/* Dimensions */}
              {image.metadata?.width && image.metadata?.height && (
                <div className="flex items-center gap-2 text-gray-300 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <ZoomIn className="w-3.5 h-3.5 text-green-400" />
                  <span className="font-mono">
                    {image.metadata.width} × {image.metadata.height}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {image.tags && image.tags.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + (0.05 * index), type: "spring" }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="px-2.5 py-1 bg-white/10 text-white rounded-full text-xs border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all cursor-default"
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical details */}
            {image.metadata && (
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  Technical Details
                </h3>
                <div className="grid grid-cols-3 gap-3 text-xs text-gray-300">
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