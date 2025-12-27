// components/UI/ImageModal.jsx - Updated with black/white theme and compact size
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
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [onNext, onPrev]);

  useEffect(() => {
    if (imageRef.current) {
      gsap.from(imageRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    }
  }, [image]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `${image.title.replace(/\s+/g, '-')}.jpg`;
    link.click();
  };

  const handleShare = async () => {
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
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg"
        onClick={onClose}
      >
        {/* Close button */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
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
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-10 backdrop-blur-md shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </motion.button>
        )}

        {onNext && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-10 backdrop-blur-md shadow-lg"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </motion.button>
        )}

        {/* CHANGED: Compact main content - single column layout */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl"
        >
          {/* Image section - Compact */}
          <div className="relative bg-black/80 rounded-2xl p-4 backdrop-blur-sm border border-white/20 shadow-2xl">
            <img
              ref={imageRef}
              src={image.imageUrl}
              alt={image.title}
              className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
            />
            
            {/* Action buttons overlay */}
            <motion.div 
              className="absolute bottom-6 left-6 right-6 flex justify-between items-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full backdrop-blur-md transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <Download className="w-5 h-5 text-white" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full backdrop-blur-md transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* CHANGED: Compact details section below image */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 bg-black/80 rounded-2xl p-6 backdrop-blur-sm border border-white/20 shadow-2xl"
          >
            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
              {image.title}
            </h2>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed mb-4 text-sm">
              {image.description}
            </p>

            {/* Metadata in single row */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              {/* Date */}
              <div className="flex items-center gap-2 text-gray-300 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{formatDate(image.createdAt)}</span>
              </div>

              {/* Dimensions */}
              <div className="flex items-center gap-2 text-gray-300 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <ZoomIn className="w-4 h-4 text-green-400" />
                <span className="font-mono text-xs">
                  {image.metadata?.width} × {image.metadata?.height}
                </span>
              </div>
            </div>

            {/* Tags */}
            {image.tags && image.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-yellow-400" />
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
                      className="px-3 py-1 bg-white/10 text-white rounded-full text-xs border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all cursor-default"
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical details - Compact */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Technical Details
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs text-gray-300">
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Format</span>
                  <span className="font-mono font-bold text-white">{image.metadata?.format?.toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Size</span>
                  <span className="font-mono font-bold text-white">
                    {(image.metadata?.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Ratio</span>
                  <span className="font-mono font-bold text-white">
                    {(image.metadata?.width / image.metadata?.height).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;