// components/Gallery/Lighting.jsx - Scene Lighting Setup
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Lighting = () => {
  const mainLightRef = useRef();
  const accentLightRef = useRef();

  // Animate main light in a circular pattern
  useFrame(({ clock }) => {
    if (mainLightRef.current) {
      const time = clock.getElapsedTime() * 0.2;
      mainLightRef.current.position.x = Math.sin(time) * 20;
      mainLightRef.current.position.z = Math.cos(time) * 20;
    }
  });

  return (
    <>
      {/* Ambient light - base illumination */}
      <ambientLight intensity={0.4} color="#ffffff" />

      {/* Main directional light - key light */}
      <directionalLight
        ref={mainLightRef}
        position={[10, 10, 10]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Accent light - rim lighting from behind */}
      <directionalLight
        ref={accentLightRef}
        position={[-10, 5, -10]}
        intensity={0.5}
        color="#4fc3f7"
      />

      {/* Fill light - soften shadows */}
      <directionalLight
        position={[0, -5, 5]}
        intensity={0.3}
        color="#ffab91"
      />

      {/* Point light - center glow */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.5}
        distance={30}
        color="#ffffff"
      />

      {/* Hemisphere light - sky/ground lighting */}
      <hemisphereLight
        skyColor="#87ceeb"
        groundColor="#362414"
        intensity={0.3}
      />

      {/* Spot lights for dramatic effect */}
      <spotLight
        position={[0, 20, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.5}
        castShadow
        color="#ffffff"
      />
    </>
  );
};

export default Lighting;