// components/UI/UploadModal.jsx - Updated with fun rotating animations
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Loader, Check, AlertCircle } from 'lucide-react';
import { useGalleryStore } from '../../stores/galleryStore';

const UploadModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const uploadImage = useGalleryStore(state => state.uploadImage);
  const isLoading = useGalleryStore(state => state.isLoading);
  const error = useGalleryStore(state => state.error);
  const fileInputRef = useRef();

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const selected = e.dataTransfer.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('tags', formData.tags);

    try {
      await uploadImage(data);
      setUploadSuccess(true);
      
      setTimeout(() => {
        onClose();
        setFile(null);
        setPreview(null);
        setFormData({ title: '', description: '', tags: '' });
        setUploadSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setFormData({ title: '', description: '', tags: '' });
        setUploadSuccess(false);
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-black/90 border border-white/20 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <motion.h2 
                className="text-xl font-bold text-white flex items-center gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  animate={{ 
                    rotate: uploadSuccess ? 0 : [0, -10, 10, -10, 0],
                  }}
                  transition={{ 
                    duration: uploadSuccess ? 0 : 0.5,
                    repeat: uploadSuccess ? 0 : Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Upload className="w-6 h-6 text-white" />
                </motion.div>
                Upload Image
              </motion.h2>
              <motion.button 
                onClick={handleClose} 
                disabled={isLoading}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Drop Zone */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-56 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                  ${isDragOver 
                    ? 'border-white bg-white/10 scale-105' 
                    : preview 
                      ? 'border-transparent' 
                      : 'border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative w-full h-full"
                    >
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                      <motion.button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreview(null);
                        }}
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-3 right-3 p-2 bg-white hover:bg-gray-200 rounded-full text-black shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center h-full gap-3"
                    >
                      <motion.div 
                        className="p-4 bg-white/10 rounded-full"
                        animate={{ 
                          y: [0, -10, 0],
                          scale: isDragOver ? 1.2 : 1,
                          rotate: isDragOver ? 360 : 0
                        }}
                        transition={{ 
                          y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                          scale: { duration: 0.2 },
                          rotate: { duration: 0.6 }
                        }}
                      >
                        <ImageIcon className="w-10 h-10 text-white" />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-white text-sm font-medium mb-1">
                          {isDragOver ? "Drop image here" : "Click or drag image here"}
                        </p>
                        <p className="text-gray-400 text-xs">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </motion.div>

              {/* Inputs */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="Give your image a title"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                  <textarea
                    placeholder="Describe your image"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="space, galaxy, nebula (comma separated)"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    </motion.div>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button with fun animations */}
              <motion.button
                type="submit"
                disabled={isLoading || !file || uploadSuccess}
                whileHover={!isLoading && !uploadSuccess ? "hover" : {}}
                whileTap={!isLoading && !uploadSuccess ? { scale: 0.98 } : {}}
                className="relative w-full py-3.5 bg-white hover:bg-gray-200 text-black rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden shadow-lg"
              >
                {/* Animated shimmer */}
                {!isLoading && !uploadSuccess && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    initial={{ x: "-200%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                  />
                )}
                
                {/* Sparkles on hover */}
                <motion.div 
                  className="absolute inset-0" 
                  initial="hidden" 
                  variants={{
                    hidden: {},
                    hover: {}
                  }}
                  whileHover="hover"
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-black rounded-full"
                      style={{
                        left: `${15 + i * 10}%`,
                        top: `${20 + (i % 3) * 30}%`,
                      }}
                      variants={{
                        hidden: { scale: 0, opacity: 0 },
                        hover: { 
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          transition: {
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.1
                          }
                        }
                      }}
                    />
                  ))}
                </motion.div>
                
                <AnimatePresence mode="wait">
                  {uploadSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="flex items-center gap-2 relative z-10"
                    >
                      <Check className="w-5 h-5" />
                      <span>Upload Successful!</span>
                    </motion.div>
                  ) : isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 relative z-10"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader className="w-5 h-5" />
                      </motion.div>
                      <span>Uploading...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 relative z-10"
                    >
                      <motion.div
                        variants={{
                          hover: { 
                            rotate: 360,
                            y: [-3, 0, -3]
                          }
                        }}
                        transition={{ 
                          rotate: { duration: 0.6, ease: "easeInOut" },
                          y: { duration: 1.5, repeat: Infinity }
                        }}
                      >
                        <Upload className="w-5 h-5" />
                      </motion.div>
                      <span>Upload to Galaxy</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;