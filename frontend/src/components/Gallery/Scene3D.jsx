// components/Gallery/Scene3D.jsx
import React, { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Line, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import ImageCard3D from './ImageCard3D';
import Lighting from './Lighting';
import { spiralLayout, gridLayout, sphereLayout, waveLayout, webLayout } from '../../utils/layoutHelpers';
import { entranceAnimation } from '../../utils/animationHelpers';
import LoadingScreen from '../UI/LoadingScreen';

// Sparse twinkling stars for deep space feel
const SpaceStars = () => {
  const starsRef = useRef();
  
  useEffect(() => {
    if (!starsRef.current) return;
    const count = 300;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
      sizes[i] = Math.random() < 0.1 ? 0.3 : 0.1;
    }
    
    starsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  }, []);

  useFrame((state) => {
    if (!starsRef.current) return;
    const time = state.clock.getElapsedTime();
    starsRef.current.rotation.y = time * 0.02;
    starsRef.current.material.opacity = 0.6 + Math.sin(time) * 0.2;
  });
  
  return (
    <points ref={starsRef}>
      <bufferGeometry />
      <pointsMaterial
        color="#ffffff"
        size={0.15}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const WebConnections = ({ images, color = "white", opacity = 0.15 }) => {
    const lines = useMemo(() => {
        const connections = [];
        images.forEach((imgA, i) => {
            const distances = images.map((imgB, j) => {
                if (i === j) return { idx: j, dist: Infinity };
                const dx = imgA.position[0] - imgB.position[0];
                const dy = imgA.position[1] - imgB.position[1];
                const dz = imgA.position[2] - imgB.position[2];
                return { idx: j, dist: Math.sqrt(dx*dx + dy*dy + dz*dz) };
            });
            
            distances.sort((a, b) => a.dist - b.dist);
            distances.slice(0, 2).forEach(({ idx }) => {
                 if (i < idx) {
                     connections.push([
                         new THREE.Vector3(...imgA.position),
                         new THREE.Vector3(...images[idx].position)
                     ]);
                 }
            });
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
                    lineWidth={1} 
                />
            ))}
        </group>
    );
};

// --- NEW COMPONENT: Handles the rotation INSIDE the Canvas ---
const RotatingScene = ({ children, isHovering, isSelected }) => {
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (groupRef.current && !isSelected && !isHovering) {
            // Rotate the whole web structure slowly
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

        {/* Wrap content in RotatingScene which contains the useFrame hook */}
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
                    // In web layout, we wrap with Billboard to keep images facing camera
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