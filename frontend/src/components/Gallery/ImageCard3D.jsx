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
    if (isMobile) return; // Disable hover on mobile
    
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
    if (onHover) onHover(); 

    if (meshRef?.current) {
        gsap.to(meshRef.current.scale, { 
            x: isSelected ? 1.7 : 1.5,
            y: isSelected ? 1.7 : 1.5, 
            z: isSelected ? 1.7 : 1.5, 
            duration: 0.3, 
            ease: 'power2.out' 
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
    if (isSelected) targetScale = isMobile ? 1.2 : 1.3;
    else if (isHovered && !isMobile) targetScale = 1.5;

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