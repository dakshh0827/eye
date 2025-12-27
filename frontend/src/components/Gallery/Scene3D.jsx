// components/Gallery/Scene3D.jsx - Enhanced with denser stars and improved web connections
import React, { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Line, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import ImageCard3D from './ImageCard3D';
import Lighting from './Lighting';
import { spiralLayout, gridLayout, sphereLayout, waveLayout, webLayout } from '../../utils/layoutHelpers';
import { entranceAnimation } from '../../utils/animationHelpers';
import LoadingScreen from '../UI/LoadingScreen';

// Enhanced dense twinkling stars for deep space feel
const SpaceStars = () => {
  const starsRef = useRef();
  const twinkleRef = useRef([]);
  
  useEffect(() => {
    if (!starsRef.current) return;
    
    // Increased star count for denser background
    const count = 1500; // Increased from 300
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    twinkleRef.current = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Distribute stars in a larger volume
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      
      // Vary star sizes more dramatically
      const rand = Math.random();
      if (rand < 0.05) sizes[i] = 0.5; // Bright stars
      else if (rand < 0.15) sizes[i] = 0.3; // Medium stars
      else sizes[i] = 0.15; // Dim stars
      
      // Vary star colors (white to slight blue)
      const colorVariation = Math.random();
      colors[i * 3] = 0.9 + colorVariation * 0.1; // R
      colors[i * 3 + 1] = 0.9 + colorVariation * 0.1; // G
      colors[i * 3 + 2] = 1.0; // B (slightly more blue)
      
      // Random twinkle phase
      twinkleRef.current[i] = Math.random() * Math.PI * 2;
    }
    
    starsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, []);

  useFrame((state) => {
    if (!starsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow rotation
    starsRef.current.rotation.y = time * 0.01;
    starsRef.current.rotation.x = Math.sin(time * 0.005) * 0.05;
    
    // Twinkle effect
    const sizes = starsRef.current.geometry.attributes.size.array;
    for (let i = 0; i < sizes.length; i++) {
      const baseSize = i % 20 === 0 ? 0.5 : i % 10 === 0 ? 0.3 : 0.15;
      const twinkle = Math.sin(time * 2 + twinkleRef.current[i]) * 0.3 + 0.7;
      sizes[i] = baseSize * twinkle;
    }
    starsRef.current.geometry.attributes.size.needsUpdate = true;
  });
  
  return (
    <points ref={starsRef}>
      <bufferGeometry />
      <pointsMaterial
        vertexColors
        size={0.2}
        sizeAttenuation
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Enhanced Web Connections - Creates a strongly connected component
const WebConnections = ({ images, color = "white", opacity = 0.2 }) => {
  const lines = useMemo(() => {
    if (images.length < 2) return [];
    
    const connections = [];
    const connected = new Set();
    
    // Helper to calculate distance
    const distance = (a, b) => {
      const dx = a.position[0] - b.position[0];
      const dy = a.position[1] - b.position[1];
      const dz = a.position[2] - b.position[2];
      return Math.sqrt(dx*dx + dy*dy + dz*dz);
    };
    
    // Strategy: Connect each node to its 3 nearest neighbors
    // This ensures strong connectivity
    images.forEach((imgA, i) => {
      const distances = images
        .map((imgB, j) => ({ idx: j, dist: i === j ? Infinity : distance(imgA, imgB) }))
        .sort((a, b) => a.dist - b.dist);
      
      // Connect to 3 nearest neighbors (or fewer if not enough images)
      const connectTo = Math.min(3, distances.length - 1);
      for (let k = 0; k < connectTo; k++) {
        const j = distances[k].idx;
        // Use a canonical order to avoid duplicate lines
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!connected.has(key)) {
          connected.add(key);
          connections.push([
            new THREE.Vector3(...imgA.position),
            new THREE.Vector3(...images[j].position)
          ]);
        }
      }
    });
    
    // Ensure full connectivity: If any node is isolated, connect it to nearest
    const nodeConnections = new Map();
    connections.forEach(([a, b]) => {
      const aKey = `${a.x},${a.y},${a.z}`;
      const bKey = `${b.x},${b.y},${b.z}`;
      nodeConnections.set(aKey, (nodeConnections.get(aKey) || 0) + 1);
      nodeConnections.set(bKey, (nodeConnections.get(bKey) || 0) + 1);
    });
    
    images.forEach((img, i) => {
      const key = `${img.position[0]},${img.position[1]},${img.position[2]}`;
      if (!nodeConnections.has(key) || nodeConnections.get(key) === 0) {
        // Find nearest node and connect
        const distances = images
          .map((imgB, j) => ({ idx: j, dist: i === j ? Infinity : distance(img, imgB) }))
          .sort((a, b) => a.dist - b.dist);
        
        if (distances[0].dist !== Infinity) {
          connections.push([
            new THREE.Vector3(...img.position),
            new THREE.Vector3(...images[distances[0].idx].position)
          ]);
        }
      }
    });
    
    return connections;
  }, [images]);

  return (
    <group>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={color}
          opacity={opacity}
          transparent
          lineWidth={1.5}
          dashed={false}
        />
      ))}
    </group>
  );
};

// Rotating Scene Component
const RotatingScene = ({ children, isHovering, isSelected }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current && !isSelected && !isHovering) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

const Scene3D = ({ 
  images, 
  onImageClick, 
  selectedImage,
  layout = 'web' 
}) => {
  const [layoutedImages, setLayoutedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  
  const meshRefs = useRef([]);
  const cameraRef = useRef();
  const controlsRef = useRef();

  // Layout calculation
  useEffect(() => {
    if (!images || images.length === 0) return;
    let positioned = [];
    switch (layout) {
      case 'web': positioned = webLayout(images); break;
      case 'spiral': positioned = spiralLayout(images); break;
      case 'grid': positioned = gridLayout(images); break;
      case 'sphere': positioned = sphereLayout(images); break;
      case 'wave': positioned = waveLayout(images); break;
      default: positioned = webLayout(images);
    }
    setLayoutedImages(positioned);
  }, [images, layout]);

  // Loading Fix
  useEffect(() => {
    if (layoutedImages.length === 0) return;
    setIsLoading(true);
    const startTime = Date.now();
    let timeoutId;
    let frameId;

    const check = () => {
      const validMeshes = meshRefs.current.filter(r => r && r.current).map(r => r.current);
      if (validMeshes.length > 0 || Date.now() - startTime > 3000) {
        if (validMeshes.length > 0) entranceAnimation(validMeshes);
        setIsLoading(false);
      } else {
        timeoutId = setTimeout(() => { frameId = requestAnimationFrame(check); }, 100);
      }
    };
    check();
    return () => { clearTimeout(timeoutId); cancelAnimationFrame(frameId); };
  }, [layoutedImages]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      
      <Canvas
        className="w-full h-full"
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />
        
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 35]} fov={50} />
        <Lighting />
        <Environment preset="night" />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={10}
          maxDistance={60}
          autoRotate={false}
        />

        <fog attach="fog" args={['#000000', 30, 90]} />

        <RotatingScene isHovering={isHovering} isSelected={!!selectedImage}>
          {layout === 'web' && (
            <WebConnections images={layoutedImages} />
          )}

          <Suspense fallback={null}>
            {layoutedImages.map((image, index) => {
              if (!meshRefs.current[index]) meshRefs.current[index] = React.createRef();

              const commonProps = {
                key: image._id || image.id,
                image: image,
                onClick: () => onImageClick(image),
                isSelected: selectedImage?._id === image._id,
                meshRef: meshRefs.current[index],
                onHover: () => setIsHovering(true),
                onHoverOut: () => setIsHovering(false)
              };

              if (layout === 'web') {
                return (
                  <Billboard 
                    key={commonProps.key} 
                    position={image.position} 
                    follow={true} 
                    lockX={false} 
                    lockY={false} 
                    lockZ={false}
                  >
                    <ImageCard3D 
                      {...commonProps} 
                      position={[0,0,0]} 
                      rotation={[0,0,0]} 
                    />
                  </Billboard>
                );
              }

              return (
                <ImageCard3D
                  {...commonProps}
                  position={image.position}
                  rotation={image.rotation}
                />
              );
            })}
          </Suspense>
        </RotatingScene>

        <SpaceStars />
      </Canvas>
    </>
  );
};

export default Scene3D;