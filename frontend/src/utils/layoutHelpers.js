// utils/layoutHelpers.js - 3D Positioning Algorithms

/**
 * Spiral Layout - Images arranged in a 3D spiral
 * Perfect for showcasing chronological content
 */
export const spiralLayout = (images, config = {}) => {
  const { 
    radius = 15,        // Spiral radius
    height = 20,        // Total vertical span
    rotations = 3,      // Number of full rotations
    tightness = 0.8     // How tight the spiral is (0-1)
  } = config;
  
  return images.map((img, i) => {
    const t = i / images.length;
    const angle = t * Math.PI * 2 * rotations;
    const spiralRadius = radius * (1 - t * tightness);
    
    return {
      ...img,
      position: [
        Math.cos(angle) * spiralRadius,
        (t - 0.5) * height,
        Math.sin(angle) * spiralRadius
      ],
      rotation: [0, -angle + Math.PI / 2, 0]
    };
  });
};

/**
 * Grid Layout - Classic 3D grid with depth variation
 * Best for organized, catalog-style galleries
 */
export const gridLayout = (images, config = {}) => {
  const { 
    cols = 5,              // Columns per row
    spacing = 4,           // Space between images
    depthVariation = 3,    // Random Z-axis variation
    rowOffset = 0.5        // Stagger alternate rows
  } = config;
  
  return images.map((img, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const isOddRow = row % 2 === 1;
    
    return {
      ...img,
      position: [
        (col - cols / 2) * spacing + (isOddRow ? rowOffset * spacing : 0),
        (row - Math.floor(images.length / cols) / 2) * spacing * -1,
        (Math.random() - 0.5) * depthVariation
      ],
      rotation: [
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        0
      ]
    };
  });
};

export const webLayout = (images, config = {}) => {
    const {
      radius = 18,
    } = config;
  
    return images.map((img, i) => {
      // Random point inside a sphere (constellation style)
      // We use spherical coordinates but randomized for organic look
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      // Use cubic root to distribute points evenly in volume, 
      // but keep them somewhat outer to form a "shell" or thick crust
      const r = radius * (0.4 + 0.6 * Math.cbrt(Math.random())); 
  
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
  
      return {
        ...img,
        position: [x, y, z],
        // Images look at the center (0,0,0) initially, 
        // effectively facing outwards or inwards. 
        // We'll handle Billboard behavior in the Scene to ensure visibility.
        rotation: [0, 0, 0] 
      };
    });
  };

/**
 * Sphere Layout - Images distributed on sphere surface
 * Creates an immersive surrounding effect
 */
export const sphereLayout = (images, config = {}) => {
  const { 
    radius = 20,           // Sphere radius
    innerRadius = 0.7,     // Inner boundary (0-1)
    randomness = 0.2       // Position randomness
  } = config;
  
  return images.map((img, i) => {
    // Fibonacci sphere distribution for even spacing
    const phi = Math.acos(-1 + (2 * i) / images.length);
    const theta = Math.sqrt(images.length * Math.PI) * phi;
    
    // Add controlled randomness
    const r = radius * (innerRadius + (1 - innerRadius) * Math.random());
    const randomPhi = phi + (Math.random() - 0.5) * randomness;
    const randomTheta = theta + (Math.random() - 0.5) * randomness;
    
    const x = r * Math.cos(randomTheta) * Math.sin(randomPhi);
    const y = r * Math.cos(randomPhi);
    const z = r * Math.sin(randomTheta) * Math.sin(randomPhi);
    
    return {
      ...img,
      position: [x, y, z],
      rotation: [
        0,
        Math.atan2(x, z),
        0
      ]
    };
  });
};

/**
 * Wave Layout - Flowing wave pattern
 * Creates dynamic, organic arrangements
 */
export const waveLayout = (images, config = {}) => {
  const { 
    cols = 5,              // Columns per row
    spacing = 4,           // Space between images
    amplitude = 3,         // Wave height
    frequency = 0.5,       // Wave frequency
    waveType = 'sine'      // 'sine', 'cosine', or 'both'
  } = config;
  
  return images.map((img, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = (col - cols / 2) * spacing;
    const z = (row - Math.floor(images.length / cols) / 2) * spacing;
    
    let y = 0;
    
    switch (waveType) {
      case 'sine':
        y = Math.sin(x * frequency) * amplitude;
        break;
      case 'cosine':
        y = Math.cos(z * frequency) * amplitude;
        break;
      case 'both':
      default:
        y = Math.sin(x * frequency) * amplitude + 
            Math.cos(z * frequency) * amplitude;
    }
    
    return {
      ...img,
      position: [x, y, z],
      rotation: [
        Math.sin(x * frequency) * 0.1,
        0,
        Math.cos(z * frequency) * 0.1
      ]
    };
  });
};

/**
 * Helix Layout - Double helix DNA-like structure
 * Elegant for storytelling galleries
 */
export const helixLayout = (images, config = {}) => {
  const { 
    radius = 10,           // Helix radius
    height = 30,           // Total height
    coils = 4,             // Number of complete coils
    strands = 2            // Number of parallel helixes
  } = config;
  
  return images.map((img, i) => {
    const t = i / images.length;
    const strand = i % strands;
    const angle = (t * Math.PI * 2 * coils) + (strand * Math.PI * 2 / strands);
    
    return {
      ...img,
      position: [
        Math.cos(angle) * radius,
        (t - 0.5) * height,
        Math.sin(angle) * radius
      ],
      rotation: [0, -angle, 0]
    };
  });
};

/**
 * Circular Layout - Images in concentric circles
 * Great for category-based organization
 */
export const circularLayout = (images, config = {}) => {
  const { 
    layers = 3,            // Number of concentric circles
    radiusStep = 5,        // Distance between circles
    startRadius = 5        // Inner circle radius
  } = config;
  
  const imagesPerLayer = Math.ceil(images.length / layers);
  
  return images.map((img, i) => {
    const layer = Math.floor(i / imagesPerLayer);
    const indexInLayer = i % imagesPerLayer;
    const itemsInThisLayer = Math.min(imagesPerLayer, images.length - layer * imagesPerLayer);
    
    const radius = startRadius + layer * radiusStep;
    const angle = (indexInLayer / itemsInThisLayer) * Math.PI * 2;
    
    return {
      ...img,
      position: [
        Math.cos(angle) * radius,
        -layer * 2,
        Math.sin(angle) * radius
      ],
      rotation: [0, -angle + Math.PI / 2, 0]
    };
  });
};

/**
 * Random Cloud Layout - Organic clustering
 * Perfect for artistic, exploratory galleries
 */
export const cloudLayout = (images, config = {}) => {
  const { 
    spread = 20,           // Overall spread
    clusteriness = 0.5,    // How clustered (0-1)
    verticalSpread = 10    // Vertical variation
  } = config;
  
  return images.map((img, i) => {
    // Create clusters using simplex noise simulation
    const clusterX = Math.sin(i * 0.5) * spread * clusteriness;
    const clusterZ = Math.cos(i * 0.5) * spread * clusteriness;
    
    const x = clusterX + (Math.random() - 0.5) * spread * (1 - clusteriness);
    const y = (Math.random() - 0.5) * verticalSpread;
    const z = clusterZ + (Math.random() - 0.5) * spread * (1 - clusteriness);
    
    return {
      ...img,
      position: [x, y, z],
      rotation: [
        (Math.random() - 0.5) * 0.3,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.3
      ]
    };
  });
};

/**
 * Timeline Layout - Linear chronological arrangement
 * Perfect for historical or sequential content
 */
export const timelineLayout = (images, config = {}) => {
  const { 
    spacing = 5,           // Distance between images
    curvature = 0.3,       // Path curvature
    elevation = 2          // Height variation
  } = config;
  
  return images.map((img, i) => {
    const t = i / (images.length - 1);
    const x = (i - images.length / 2) * spacing;
    const z = Math.sin(t * Math.PI) * curvature * spacing * images.length / 10;
    const y = Math.sin(t * Math.PI * 2) * elevation;
    
    return {
      ...img,
      position: [x, y, z],
      rotation: [0, Math.atan2(z, spacing) * 0.5, 0]
    };
  });
};

/**
 * Helper: Transition between layouts with animation
 */
export const transitionLayout = (fromLayout, toLayout, progress = 0) => {
  return fromLayout.map((img, i) => {
    const from = img.position;
    const to = toLayout[i]?.position || from;
    
    return {
      ...img,
      position: [
        from[0] + (to[0] - from[0]) * progress,
        from[1] + (to[1] - from[1]) * progress,
        from[2] + (to[2] - from[2]) * progress
      ]
    };
  });
};

/**
 * Helper: Calculate optimal layout based on image count
 */
export const autoSelectLayout = (imageCount) => {
  if (imageCount <= 12) return 'circular';
  if (imageCount <= 30) return 'grid';
  if (imageCount <= 50) return 'helix';
  return 'sphere';
};