// components/UI/ImageModal.jsx - Detailed Image View Modal
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Eye, Calendar, Tag, Download, Share2, ZoomIn } from 'lucide-react';
import gsap from 'gsap';

const ImageModal = ({ image, onClose, onNext, onPrev, onLike }) => {
  const modalRef = useRef();
  const imageRef = useRef();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [onNext, onPrev]);

  // Image entrance animation
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
      // Fallback: copy link
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Close button */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>

        {/* Navigation buttons */}
        {onPrev && (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <span className="text-white text-2xl">←</span>
          </motion.button>
        )}

        {onNext && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <span className="text-white text-2xl">→</span>
          </motion.button>
        )}

        {/* Main content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl grid md:grid-cols-[2fr,1fr] gap-6"
        >
          {/* Image section */}
          <div className="relative bg-black/50 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <img
              ref={imageRef}
              src={image.imageUrl}
              alt={image.title}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            
            {/* Image overlay info */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Details section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 overflow-y-auto max-h-[70vh]"
          >
            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-4">
              {image.title}
            </h2>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed mb-6">
              {image.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Views</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {image.views?.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="text-gray-400 text-sm">Likes</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {image.likes?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            {/* Like button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLike && onLike(image._id)}
              className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg font-semibold mb-6 transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Like this image
            </motion.button>

            {/* Metadata */}
            <div className="space-y-4 mb-6">
              {/* Date */}
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500">Uploaded</p>
                  <p className="text-sm">{formatDate(image.createdAt)}</p>
                </div>
              </div>

              {/* Dimensions */}
              <div className="flex items-center gap-3 text-gray-300">
                <ZoomIn className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-500">Dimensions</p>
                  <p className="text-sm">
                    {image.metadata?.width} × {image.metadata?.height}
                  </p>
                </div>
              </div>

              {/* Uploader */}
              {image.metadata?.uploadedBy && (
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {image.metadata.uploadedBy[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uploaded by</p>
                    <p className="text-sm">{image.metadata.uploadedBy}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {image.tags && image.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical details */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Technical Details
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-mono">{image.metadata?.format?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>File Size:</span>
                  <span className="font-mono">
                    {(image.metadata?.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Aspect Ratio:</span>
                  <span className="font-mono">
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