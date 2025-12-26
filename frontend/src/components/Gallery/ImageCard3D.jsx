// components/Gallery/ImageCard3D.jsx
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
  // Removed glowRef and glow mesh
  const [isHovered, setIsHovered] = useState(false);
  const [texture, setTexture] = useState(null);
  const [error, setError] = useState(false);

  const aspectRatio = image.metadata?.width / image.metadata?.height || 1;
  const cardWidth = 3;
  const cardHeight = cardWidth / aspectRatio;

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

    // Pure Scale Animation on Hover
    // Scales to 1.2 normally, or 1.4 if already selected
    if (meshRef?.current) {
        gsap.to(meshRef.current.scale, { 
            x: isSelected ? 1.4 : 1.2, 
            y: isSelected ? 1.4 : 1.2, 
            z: isSelected ? 1.4 : 1.2, 
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
    // Returns to 1.3 if selected, or 1.0 if not
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
    
    // Determine target scale based on state
    let targetScale = 1;
    if (isSelected) targetScale = 1.3;
    else if (isHovered) targetScale = 1.2;

    gsap.to(meshRef.current.scale, { 
        x: targetScale, 
        y: targetScale, 
        z: targetScale, 
        duration: 0.5, 
        ease: 'power2.out' 
    });
  }, [isSelected, meshRef]); // Removed isHovered from dep array to avoid conflict with hover handlers

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

        {/* Removed RoundedBox (Border) */}
        {/* Removed Glow Mesh (Gray Border Effect) */}

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