// components/Gallery/ImageCard3D.jsx - Fixed texture loading
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { hoverIn, hoverOut } from '../../utils/animationHelpers';

const ImageCard3D = ({ 
  image, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  onClick,
  isSelected,
  meshRef
}) => {
  const groupRef = useRef();
  const materialRef = useRef();
  const glowRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [texture, setTexture] = useState(null);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Calculate aspect ratio for proper image display
  const aspectRatio = image.metadata?.width / image.metadata?.height || 1;
  const cardWidth = 3;
  const cardHeight = cardWidth / aspectRatio;

  // Load texture with error handling
  useEffect(() => {
    if (!image.thumbnailUrl && !image.imageUrl) {
      setError(true);
      return;
    }

    const loader = new TextureLoader();
    const urlToLoad = image.thumbnailUrl || image.imageUrl;

    loader.load(
      urlToLoad,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        setTexture(loadedTexture);
        setError(false);
      },
      undefined,
      (err) => {
        console.error('Error loading texture:', urlToLoad, err);
        setError(true);
      }
    );
  }, [image.thumbnailUrl, image.imageUrl]);

  // Load high-res texture in background
  useEffect(() => {
    if (!texture || !image.imageUrl || image.imageUrl === image.thumbnailUrl) {
      setHighResLoaded(true);
      return;
    }

    const loader = new TextureLoader();
    loader.load(
      image.imageUrl,
      (highResTexture) => {
        highResTexture.colorSpace = THREE.SRGBColorSpace;
        highResTexture.minFilter = THREE.LinearFilter;
        highResTexture.magFilter = THREE.LinearFilter;
        
        if (materialRef.current) {
          materialRef.current.map = highResTexture;
          materialRef.current.needsUpdate = true;
          setHighResLoaded(true);
        }
      },
      undefined,
      (error) => {
        console.error('Error loading high-res texture:', error);
        setHighResLoaded(true); // Set to true anyway to hide loading indicator
      }
    );
  }, [texture, image.imageUrl, image.thumbnailUrl]);

  // Hover animation
  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);

    if (meshRef?.current && glowRef?.current) {
      hoverIn(meshRef, glowRef.current.material);
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    setIsHovered(false);

    if (meshRef?.current && glowRef?.current) {
      hoverOut(meshRef, glowRef.current.material);
    }
  };

  // Click handler
  const handleClick = (e) => {
    e.stopPropagation();
    onClick && onClick(image);
  };

  // Floating animation
  useFrame((state) => {
    if (!groupRef.current || isSelected) return;

    const time = state.clock.getElapsedTime();
    const floatSpeed = 0.5 + (position[0] % 0.3);
    const floatAmount = 0.2;

    // Subtle floating motion
    groupRef.current.position.y = 
      position[1] + Math.sin(time * floatSpeed) * floatAmount;

    // Gentle rotation
    if (!isHovered) {
      groupRef.current.rotation.y = 
        rotation[1] + Math.sin(time * 0.3) * 0.05;
    }
  });

  // Scale animation based on selection
  useEffect(() => {
    if (!meshRef?.current) return;

    if (isSelected) {
      gsap.to(meshRef.current.scale, {
        x: 1.3,
        y: 1.3,
        z: 1.3,
        duration: 0.5,
        ease: 'power2.out'
      });
    } else {
      gsap.to(meshRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        ease: 'power2.in'
      });
    }
  }, [isSelected, meshRef]);

  // Show placeholder if error or no texture
  if (error || !texture) {
    return (
      <group ref={groupRef} position={position}>
        <mesh>
          <planeGeometry args={[cardWidth, cardHeight]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <Html position={[0, 0, 0.1]} center>
          <div className="bg-red-500/80 text-white px-3 py-2 rounded text-xs">
            Failed to load
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group 
      ref={groupRef} 
      position={position}
    >
      {/* Main image card with frame */}
      <group ref={meshRef}>
        {/* Image plane */}
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[cardWidth, cardHeight]} />
          <meshStandardMaterial
            ref={materialRef}
            map={texture}
            transparent
            opacity={1}
            roughness={0.3}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Frame around image */}
        <RoundedBox
          args={[cardWidth + 0.2, cardHeight + 0.2, 0.1]}
          radius={0.05}
          position={[0, 0, -0.06]}
          castShadow
        >
          <meshStandardMaterial
            color="#2a2a3e"
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>

        {/* Glow effect (visible on hover) */}
        <mesh
          ref={glowRef}
          position={[0, 0, -0.1]}
        >
          <planeGeometry args={[cardWidth + 0.5, cardHeight + 0.5]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Title label (HTML overlay - visible on hover) */}
        {isHovered && (
          <Html
            position={[0, -cardHeight / 2 - 0.5, 0]}
            center
            distanceFactor={8}
            style={{
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg backdrop-blur-sm max-w-xs">
              <p className="text-sm font-semibold truncate">
                {image.title}
              </p>
              <div className="flex gap-3 mt-1 text-xs text-gray-300">
                <span>👁️ {image.views || 0}</span>
                <span>❤️ {image.likes || 0}</span>
              </div>
            </div>
          </Html>
        )}

        {/* Loading indicator for high-res */}
        {!highResLoaded && image.imageUrl !== image.thumbnailUrl && (
          <Html
            position={[cardWidth / 2 - 0.3, cardHeight / 2 - 0.3, 0.1]}
            distanceFactor={8}
          >
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
              HD...
            </div>
          </Html>
        )}
      </group>

      {/* Point light for dramatic effect (optional) */}
      {isHovered && (
        <pointLight
          position={[0, 0, 2]}
          intensity={0.5}
          distance={5}
          color="#00d4ff"
        />
      )}
    </group>
  );
};

export default ImageCard3D;