// frontend/src/components/UI/Navigation.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Grid, Circle, Loader, Waves, Upload, Filter, Share2 } from "lucide-react";

const Navigation = ({
  onLayoutChange,
  currentLayout,
  onSearch,
  totalImages,
  onUpload,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  // Added 'Web' to layouts
  const layouts = [
    { id: "web", icon: Share2, label: "Web" },
    { id: "spiral", icon: Loader, label: "Spiral" },
    { id: "grid", icon: Grid, label: "Grid" },
    { id: "sphere", icon: Circle, label: "Sphere" },
    { id: "wave", icon: Waves, label: "Wave" },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-30 bg-black/20 backdrop-blur-sm border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            <div className="w-10 h-10 border border-white/20 bg-white/5 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="text-white text-lg">🌌</span>
            </div>
            <div>
              <h1 className="text-white font-light tracking-[0.2em] text-lg uppercase">Gallery</h1>
              <p className="text-gray-500 text-[10px] tracking-widest uppercase">sys_images: {totalImages}</p>
            </div>
          </motion.div>

          {/* Center Controls */}
          <div className="flex items-center gap-4">
            {/* Layout Selector */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors flex items-center gap-2 text-white/80 text-sm"
              >
                {React.createElement(layouts.find(l => l.id === currentLayout)?.icon || Share2, { size: 16 })}
                <span className="capitalize tracking-wide">{currentLayout}</span>
              </motion.button>

              {showLayoutMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-0 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden min-w-[200px] shadow-2xl"
                >
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => {
                        onLayoutChange(layout.id);
                        setShowLayoutMenu(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left text-sm ${
                        currentLayout === layout.id ? "text-white bg-white/5" : "text-gray-400"
                      }`}
                    >
                      {React.createElement(layout.icon, { size: 16 })}
                      <span>{layout.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              {searchOpen || searchTerm ? (
                <motion.div initial={{ width: 0 }} animate={{ width: 250 }} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search star systems..."
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-full text-white placeholder-gray-600 focus:outline-none focus:border-white/50 text-sm"
                    autoFocus
                  />
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchTerm(""); }} className="text-gray-500 hover:text-white">✕</button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full"
                >
                  <Search className="w-4 h-4 text-white" />
                </motion.button>
              )}
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} onClick={onUpload} className="px-5 py-2 bg-white text-black hover:bg-gray-200 rounded-full flex items-center gap-2 font-bold text-xs tracking-wider shadow-lg">
              <Upload className="w-3 h-3" />
              UPLOAD
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;