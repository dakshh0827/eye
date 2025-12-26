// components/UI/Navigation.jsx - Top Navigation Bar
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid, Circle, Spiral, Waves, Upload, Filter } from 'lucide-react';

const Navigation = ({ 
  onLayoutChange, 
  currentLayout, 
  onSearch, 
  onTagFilter,
  totalImages 
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  const layouts = [
    { id: 'spiral', icon: Spiral, label: 'Spiral' },
    { id: 'grid', icon: Grid, label: 'Grid' },
    { id: 'sphere', icon: Circle, label: 'Sphere' },
    { id: 'wave', icon: Waves, label: 'Wave' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleLayoutSelect = (layoutId) => {
    onLayoutChange(layoutId);
    setShowLayoutMenu(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">3D</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Gallery</h1>
              <p className="text-gray-400 text-xs">{totalImages} images</p>
            </div>
          </motion.div>

          {/* Center Controls */}
          <div className="flex items-center gap-4">
            {/* Layout Selector */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 text-white"
              >
                {React.createElement(
                  layouts.find(l => l.id === currentLayout)?.icon || Grid,
                  { size: 18 }
                )}
                <span className="capitalize">{currentLayout}</span>
              </motion.button>

              {/* Layout Menu Dropdown */}
              {showLayoutMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden min-w-[200px]"
                >
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => handleLayoutSelect(layout.id)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left ${
                        currentLayout === layout.id ? 'bg-white/10 text-blue-400' : 'text-white'
                      }`}
                    >
                      {React.createElement(layout.icon, { size: 18 })}
                      <span>{layout.label}</span>
                      {currentLayout === layout.id && (
                        <span className="ml-auto text-blue-400">✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              {searchOpen || searchTerm ? (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 300 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search images..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchTerm('');
                      onSearch('');
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5 text-white" />
                </motion.button>
              )}
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Filters"
            >
              <Filter className="w-5 h-5 text-white" />
            </motion.button>

            {/* Upload Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-colors flex items-center gap-2 text-white font-semibold"
            >
              <Upload className="w-5 h-5" />
              Upload
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;