// frontend/src/components/UI/Navigation.jsx - Enhanced with fun rotating animations
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Grid3x3, 
  Upload, 
  Orbit, 
  Circle, 
  Waves,
  Network,
  X,
  Sparkles
} from "lucide-react";

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
  const layoutMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const layouts = [
    { id: "web", icon: Network, label: "Web Network", description: "Connected nodes" },
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
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    setSearchOpen(false);
    onSearch("");
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">

          {/* Logo - with rotating emoji on hover */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <motion.div 
              className="w-10 h-10 border border-white/30 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              whileHover={{ 
                boxShadow: "0 0 30px rgba(255,255,255,0.3)",
                borderColor: "rgba(255,255,255,0.5)"
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.span 
                className="text-white text-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                🌌
              </motion.span>
            </motion.div>
            <div>
              <h1 className="text-white font-light tracking-[0.25em] text-lg uppercase">
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

          {/* Center Controls */}
          <div className="flex items-center gap-4">
            
            {/* Layout Selector - with rotating icon on hover */}
            <div className="relative" ref={layoutMenuRef}>
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className="group px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all flex items-center gap-3 text-white/90 text-sm backdrop-blur-sm shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <motion.div
                  variants={{
                    hover: { rotate: 360 }
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {React.createElement(currentLayoutData?.icon || Network, { 
                    size: 18,
                    className: "group-hover:text-white transition-colors"
                  })}
                </motion.div>
                <div className="text-left">
                  <span className="capitalize tracking-wide font-medium">
                    {currentLayoutData?.label}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: showLayoutMenu ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/50 text-xs"
                >
                  ▼
                </motion.div>
              </motion.button>

              {/* Dropdown Menu - with rotating icons on hover */}
              <AnimatePresence>
                {showLayoutMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full mt-2 left-0 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden min-w-[280px] shadow-2xl shadow-black/50"
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
                          onClick={() => {
                            onLayoutChange(layout.id);
                            setShowLayoutMenu(false);
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-4 hover:bg-white/10 transition-all rounded-xl text-left group ${
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
                            className={`p-2 rounded-lg ${
                              currentLayout === layout.id
                                ? "bg-white/20"
                                : "bg-white/5 group-hover:bg-white/10"
                            }`}
                          >
                            {React.createElement(layout.icon, { 
                              size: 18,
                              className: currentLayout === layout.id ? "text-white" : "text-gray-400 group-hover:text-white"
                            })}
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-medium text-sm tracking-wide">
                              {layout.label}
                            </div>
                            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
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

            {/* Search - with rotating icon on hover */}
            <AnimatePresence mode="wait">
              {searchOpen || searchTerm ? (
                <motion.form 
                  key="search-expanded"
                  onSubmit={handleSearchSubmit}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="relative overflow-hidden"
                >
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-6 h-6 text-gray-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search images..."
                      className="w-full pl-11 pr-10 py-2.5 bg-black/50 border border-white/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-white/50 focus:bg-black/70 text-sm transition-all backdrop-blur-sm"
                    />
                    <motion.button
                      type="button"
                      onClick={handleSearchClear}
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="absolute right-3 text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
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
                  className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all backdrop-blur-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  <motion.div
                    variants={{
                      hover: { rotate: 90 }
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Search className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Upload Button - with rotating icon */}
          <div className="flex items-center gap-3">
            <motion.button 
              onClick={onUpload}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              className="relative px-6 py-2.5 bg-gradient-to-r from-white to-gray-200 text-black rounded-full flex items-center gap-2 font-bold text-xs tracking-wider shadow-lg overflow-hidden group"
            >
              {/* Animated shimmer background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                initial={{ x: "-200%" }}
                animate={{ x: "200%" }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeInOut"
                }}
              />
              
              {/* Sparkle particles */}
              <motion.div
                className="absolute inset-0"
                initial="hidden"
                whileHover="visible"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 2) * 40}%`,
                    }}
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: { 
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        transition: {
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2
                        }
                      }
                    }}
                  />
                ))}
              </motion.div>
              
              {/* Upload icon with rotation animation */}
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
                className="relative z-10"
              >
                <Upload className="w-4 h-4" />
              </motion.div>
              
              <span className="relative z-10">UPLOAD</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;