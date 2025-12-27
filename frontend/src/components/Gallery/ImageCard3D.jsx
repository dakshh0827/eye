import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const ImageCard3D = ({ 
  image, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  onClick,
  isSelected,
  meshRef,
  onHover,
  onHoverOut,
  isMobile = false
}) => {
  const groupRef = useRef();
  const materialRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [texture, setTexture] = useState(null);
  const [error, setError] = useState(false);

  // Responsive card size based on device
  const cardWidth = isMobile ? 2.5 : 3;
  const cardHeight = isMobile ? 2.5 : 3;

  useEffect(() => {
    if (!image.thumbnailUrl && !image.imageUrl) {
      setError(true);
      return;
    }
    const loader = new TextureLoader();
    const urlToLoad = image.thumbnailUrl || image.imageUrl;

    loader.load(urlToLoad,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTexture);
      },
      undefined,
      () => setError(true)
    );
  }, [image]);

  const handlePointerOver = (e) => {
    if (isMobile) return; 
    
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
    if (onHover) onHover(); 

    if (meshRef?.current) {
        // Large scale on hover (2.2x or 2.5x)
        gsap.to(meshRef.current.scale, { 
            x: isSelected ? 2.5 : 2.2,
            y: isSelected ? 2.5 : 2.2, 
            z: isSelected ? 2.5 : 2.2, 
            duration: 0.4, 
            ease: 'back.out(1.2)'
        });
        
        // Move slightly towards camera to avoid clipping
        gsap.to(meshRef.current.position, {
            z: 1,
            duration: 0.4
        });
    }
  };

  const handlePointerOut = (e) => {
    if (isMobile) return;
    
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    setIsHovered(false);
    if (onHoverOut) onHoverOut();

    if (meshRef?.current) {
        gsap.to(meshRef.current.scale, { 
            x: isSelected ? 1.3 : 1, 
            y: isSelected ? 1.3 : 1, 
            z: isSelected ? 1.3 : 1, 
            duration: 0.3, 
            ease: 'power2.in' 
        });

        // Reset position z
        gsap.to(meshRef.current.position, {
            z: 0,
            duration: 0.3
        });
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onClick && onClick(image);
  };

  // Selection Animation
  useEffect(() => {
    if (!meshRef?.current) return;
    
    let targetScale = 1;
    if (isHovered && !isMobile) {
        targetScale = 2.2;
    } else if (isSelected) {
        targetScale = isMobile ? 1.2 : 1.3;
    }

    gsap.to(meshRef.current.scale, { 
        x: targetScale, 
        y: targetScale, 
        z: targetScale, 
        duration: 0.5, 
        ease: 'power2.out' 
    });
  }, [isSelected, meshRef, isHovered, isMobile]);

  if (error || !texture) return null;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <group ref={meshRef}>
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <planeGeometry args={[cardWidth, cardHeight]} />
          <meshStandardMaterial
            ref={materialRef}
            map={texture}
            transparent
            side={THREE.DoubleSide}
            roughness={0.4}
          />
        </mesh>

        {/* Tooltip - Only show on desktop hover */}
        {isHovered && !isMobile && (
          <Html 
            // CHANGED: Reduced the Y offset significantly. 
            // Since this coordinate gets multiplied by the hover scale (approx 2.2x), 
            // a small base offset (-0.25) results in the correct visual distance.
            position={[0, -cardHeight / 2 - 0.25, 0]} 
            center 
            distanceFactor={10} 
            style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
            zIndexRange={[100, 0]} // Ensure it appears on top
          >
            {/* CHANGED: Increased padding and changed text styling */}
            <div className="bg-black/80 border border-white/30 text-white px-4 py-2 rounded-md backdrop-blur-md shadow-xl">
              {/* CHANGED: Increased text size to text-xl and made it bold */}
              <p className="text-xl font-bold tracking-wide drop-shadow-lg">{image.title}</p>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

export default ImageCard3D;
