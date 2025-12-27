// components/Gallery/ImageCard3D.jsx - Updated with consistent sizes and enhanced hover
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
  onHoverOut
}) => {
  const groupRef = useRef();
  const materialRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [texture, setTexture] = useState(null);
  const [error, setError] = useState(false);

  // CHANGED: Consistent card size regardless of aspect ratio
  const cardWidth = 3;
  const cardHeight = 3; // Fixed height instead of calculated from aspect ratio

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
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
    if (onHover) onHover(); 

    // CHANGED: Enhanced hover scale - scales more (to 1.5 instead of 1.2)
    if (meshRef?.current) {
        gsap.to(meshRef.current.scale, { 
            x: isSelected ? 1.7 : 1.5, // Increased from 1.4/1.2
            y: isSelected ? 1.7 : 1.5, 
            z: isSelected ? 1.7 : 1.5, 
            duration: 0.3, 
            ease: 'power2.out' 
        });
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    setIsHovered(false);
    if (onHoverOut) onHoverOut();

    // Scale back
    if (meshRef?.current) {
        gsap.to(meshRef.current.scale, { 
            x: isSelected ? 1.3 : 1, 
            y: isSelected ? 1.3 : 1, 
            z: isSelected ? 1.3 : 1, 
            duration: 0.3, 
            ease: 'power2.in' 
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
    if (isSelected) targetScale = 1.3;
    else if (isHovered) targetScale = 1.5; // Enhanced hover scale

    gsap.to(meshRef.current.scale, { 
        x: targetScale, 
        y: targetScale, 
        z: targetScale, 
        duration: 0.5, 
        ease: 'power2.out' 
    });
  }, [isSelected, meshRef]);

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

        {isHovered && (
          <Html position={[0, -cardHeight / 2 - 0.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <div className="bg-black/80 border border-white/20 text-white px-3 py-1 rounded backdrop-blur-md">
              <p className="text-xs font-mono tracking-widest">{image.title}</p>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

export default ImageCard3D;