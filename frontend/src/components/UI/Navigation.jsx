// frontend/src/components/UI/Navigation.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Grid3x3, 
  Upload, 
  Orbit, 
  Circle, 
  Waves,
  Shell,
  X,
  Menu
} from "lucide-react";

const Navigation = ({
  onLayoutChange,
  currentLayout,
  onSearch,
  totalImages,
  onUpload,
  isMobile
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const layoutMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const layouts = [
    { id: "web", icon: Shell, label: "Strings", description: "Connected strings" },
    { id: "spiral", icon: Orbit, label: "Spiral", description: "Rotating helix" },
    { id: "grid", icon: Grid3x3, label: "Grid", description: "Organized matrix" },
    { id: "sphere", icon: Circle, label: "Sphere", description: "3D globe" },
    { id: "wave", icon: Waves, label: "Wave", description: "Flowing pattern" },
  ];

  const currentLayoutData = layouts.find(l => l.id === currentLayout);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (layoutMenuRef.current && !layoutMenuRef.current.contains(event.target)) {
        setShowLayoutMenu(false);
      }
    };

    if (showLayoutMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLayoutMenu]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    if (isMobile) setMobileMenuOpen(false);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    setSearchOpen(false);
    onSearch("");
  };

  const handleLayoutSelect = (layoutId) => {
    onLayoutChange(layoutId);
    setShowLayoutMenu(false);
    if (isMobile) setMobileMenuOpen(false);
  };

  const handleUpload = () => {
    onUpload();
    if (isMobile) setMobileMenuOpen(false);
  };

  // Mobile Menu
  if (isMobile) {
    return (
      <>
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-md border-b border-white/10"
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm"><img src="/favicon.ico"/></span>
                </div>
                <div>
                  <h1 className="text-white font-light tracking-[0.2em] text-sm uppercase">eye</h1>
                  <p className="text-gray-500 text-[8px] tracking-widest uppercase font-mono">
                    memories: {totalImages}
                  </p>
                </div>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </motion.button>
            </div>
          </div>
        </motion.nav>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-14 left-0 right-0 z-20 bg-black/95 backdrop-blur-xl border-b border-white/20 shadow-2xl"
            >
              <div className="p-4 space-y-4">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search images..."
                    className="w-full pl-10 pr-3 py-2.5 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 text-sm"
                  />
                </form>

                {/* Layout Selector */}
                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Layout</p>
                  <div className="grid grid-cols-2 gap-2">
                    {layouts.map((layout) => (
                      <motion.button
                        key={layout.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLayoutSelect(layout.id)}
                        className={`p-3 flex flex-col items-center gap-2 rounded-lg border transition-all ${
                          currentLayout === layout.id
                            ? "bg-white/20 border-white/40 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {React.createElement(layout.icon, { size: 18 })}
                        <span className="text-xs font-medium">{layout.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Upload Button */}
                <motion.button
                  onClick={handleUpload}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-gradient-to-r from-white to-gray-200 text-black rounded-lg flex items-center justify-center gap-2 font-bold text-sm tracking-wider shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  UPLOAD
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop/Tablet Navigation
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-md border-b border-white/10"
    >
      {/* CHANGED: 
        1. Removed 'max-w-7xl mx-auto' to allow full width.
        2. Added 'w-full'.
        3. Adjusted px padding for better corner spacing.
      */}
      <div className="w-full px-6 sm:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-between">

          {/* LEFT: Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0"
          >
            <motion.div 
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              whileHover={{ 
                boxShadow: "0 0 30px rgba(255,255,255,0.3)",
                borderColor: "rgba(255,255,255,0.5)"
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.span 
                className="text-white text-base sm:text-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <img src="/favicon.ico"/>
              </motion.span>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-white font-light tracking-[0.25em] text-base sm:text-lg uppercase">
                eye
              </h1>
              <motion.p 
                className="text-gray-500 text-[10px] tracking-widest uppercase font-mono"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                memories: {totalImages}
              </motion.p>
            </div>
          </motion.div>

          {/* CENTER: Controls (Layout + Search) */}
          {/* Using flex-1 and justify-center pushes the siblings to the far edges */}
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 mx-4">
            
            {/* Layout Selector */}
            <div className="relative" ref={layoutMenuRef}>
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className="group px-3 sm:px-5 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all flex items-center gap-2 sm:gap-3 text-white/90 text-xs sm:text-sm backdrop-blur-sm shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                <motion.div
                  variants={{
                    hover: { rotate: 360 }
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {React.createElement(currentLayoutData?.icon || Shell, { 
                    size: window.innerWidth < 640 ? 14 : 18,
                    className: "group-hover:text-white transition-colors"
                  })}
                </motion.div>
                <span className="hidden md:inline capitalize tracking-wide font-medium">
                  {currentLayoutData?.label}
                </span>
                <motion.div
                  animate={{ rotate: showLayoutMenu ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/50 text-xs"
                >
                  ▼
                </motion.div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showLayoutMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden min-w-[240px] sm:min-w-[280px] shadow-2xl shadow-black/50"
                  >
                    <div className="p-2">
                      {layouts.map((layout, index) => (
                        <motion.button
                          key={layout.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover="hover"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleLayoutSelect(layout.id)}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-3 sm:gap-4 hover:bg-white/10 transition-all rounded-xl text-left group cursor-pointer ${
                            currentLayout === layout.id 
                              ? "bg-white/10 text-white shadow-inner" 
                              : "text-gray-400"
                          }`}
                        >
                          <motion.div
                            variants={{
                              hover: { rotate: 360, scale: 1.2 }
                            }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className={`p-1.5 sm:p-2 rounded-lg ${
                              currentLayout === layout.id
                                ? "bg-white/20"
                                : "bg-white/5 group-hover:bg-white/10"
                            }`}
                          >
                            {React.createElement(layout.icon, { 
                              size: window.innerWidth < 640 ? 14 : 18,
                              className: currentLayout === layout.id ? "text-white" : "text-gray-400 group-hover:text-white"
                            })}
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-medium text-xs sm:text-sm tracking-wide">
                              {layout.label}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                              {layout.description}
                            </div>
                          </div>
                          {currentLayout === layout.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search */}
            <AnimatePresence mode="wait">
              {searchOpen || searchTerm ? (
                <motion.form 
                  key="search-expanded"
                  onSubmit={handleSearchSubmit}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: window.innerWidth < 640 ? 180 : 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="relative overflow-hidden"
                >
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-8 sm:pl-11 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-black/50 border border-white/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-white/50 focus:bg-black/70 text-xs sm:text-sm transition-all backdrop-blur-sm"
                    />
                    <motion.button
                      type="button"
                      onClick={handleSearchClear}
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="absolute right-2 sm:right-3 text-gray-500 hover:text-white transition-colors  cursor-pointer"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.button
                  key="search-collapsed"
                  whileHover="hover"
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all backdrop-blur-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
                >
                  <motion.div
                    variants={{
                      hover: { rotate: 90 }
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Upload Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <motion.button 
              onClick={handleUpload}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              className="group px-4 sm:px-6 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all flex items-center gap-2 sm:gap-3 text-white/90 text-xs sm:text-sm backdrop-blur-sm shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
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
                  y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-white transition-colors" />
              </motion.div>
              
              <span className="tracking-wide font-medium">UPLOAD</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
