// components/Gallery/Scene3D.jsx - Main Three.js Scene
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import ImageCard3D from './ImageCard3D';
import Lighting from './Lighting';
import { spiralLayout } from '../../utils/layoutHelpers';
import { entranceAnimation } from '../../utils/animationHelpers';
import LoadingScreen from '../UI/LoadingScreen';

const Scene3D = ({ 
  images, 
  onImageClick, 
  selectedImage,
  layout = 'spiral' 
}) => {
  const [layoutedImages, setLayoutedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const meshRefs = useRef([]);
  const cameraRef = useRef();
  const controlsRef = useRef();

  // Apply layout algorithm to images
  useEffect(() => {
    if (!images || images.length === 0) return;

    let positioned = [];
    
    switch (layout) {
      case 'spiral':
        positioned = spiralLayout(images, { 
          radius: 15, 
          height: 25, 
          rotations: 3 
        });
        break;
      case 'grid':
        positioned = gridLayout(images, { 
          cols: 5, 
          spacing: 4,
          depthVariation: 3
        });
        break;
      case 'sphere':
        positioned = sphereLayout(images, { radius: 20 });
        break;
      case 'wave':
        positioned = waveLayout(images, { 
          cols: 5, 
          spacing: 4,
          amplitude: 3
        });
        break;
      default:
        positioned = spiralLayout(images);
    }
    
    setLayoutedImages(positioned);
  }, [images, layout]);

  // Entrance animation after scene loads
  useEffect(() => {
    if (layoutedImages.length > 0 && meshRefs.current.length > 0) {
      // Small delay to ensure meshes are ready
      setTimeout(() => {
        const validMeshes = meshRefs.current.filter(ref => ref?.current);
        const meshObjects = validMeshes.map(ref => ref.current);
        
        if (meshObjects.length > 0) {
          entranceAnimation(meshObjects);
          setIsLoading(false);
        }
      }, 100);
    }
  }, [layoutedImages]);

  // Handle scroll-based camera movement
  useEffect(() => {
    const handleScroll = (e) => {
      if (!cameraRef.current || !controlsRef.current) return;
      
      const delta = e.deltaY * 0.01;
      const target = controlsRef.current.target;
      
      // Move camera target along Y axis based on scroll
      target.y += delta;
      target.y = Math.max(-20, Math.min(20, target.y)); // Clamp
      
      controlsRef.current.update();
    };

    window.addEventListener('wheel', handleScroll, { passive: true });
    return () => window.removeEventListener('wheel', handleScroll);
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}
      
      <Canvas
        className="w-full h-full"
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]} // Pixel ratio for retina displays
      >
        {/* Camera */}
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[0, 0, 30]}
          fov={60}
          near={0.1}
          far={1000}
        />

        {/* Lighting */}
        <Lighting />

        {/* Environment map for reflections */}
        <Environment preset="sunset" />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={10}
          maxDistance={50}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
          target={[0, 0, 0]}
        />

        {/* Fog for depth perception */}
        <fog attach="fog" args={['#1a1a2e', 30, 80]} />

        {/* Image Cards */}
        <Suspense fallback={null}>
          {layoutedImages.map((image, index) => {
            // Create ref for this mesh
            if (!meshRefs.current[index]) {
              meshRefs.current[index] = React.createRef();
            }

            return (
              <ImageCard3D
                key={image._id || image.id}
                image={image}
                position={image.position}
                rotation={image.rotation || [0, 0, 0]}
                onClick={() => onImageClick(image)}
                isSelected={selectedImage?._id === image._id}
                meshRef={meshRefs.current[index]}
              />
            );
          })}
        </Suspense>

        {/* Ambient particles/stars for atmosphere (optional) */}
        <Stars />
      </Canvas>
    </>
  );
};

// Optional: Star field for atmosphere
const Stars = () => {
  const starsRef = useRef();
  
  useEffect(() => {
    if (!starsRef.current) return;
    
    const positions = new Float32Array(1000 * 3);
    
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    starsRef.current.setAttribute('position', 
      new THREE.BufferAttribute(positions, 3)
    );
  }, []);
  
  return (
    <points>
      <bufferGeometry ref={starsRef} />
      <pointsMaterial
        color="#ffffff"
        size={0.1}
        sizeAttenuation
        transparent
        opacity={0.6}
      />
    </points>
  );
};

export default Scene3D;