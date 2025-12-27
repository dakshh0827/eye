import gsap from 'gsap';

/**
 * Hover animation - Scale up with glow
 */
export const hoverIn = (meshRef, glowMaterial) => {
  const timeline = gsap.timeline();
  
  timeline
    .to(meshRef.current.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 0.3,
      ease: 'power2.out'
    })
    .to(meshRef.current.rotation, {
      y: meshRef.current.rotation.y + 0.1,
      duration: 0.3,
      ease: 'power2.out'
    }, '<')
    .to(glowMaterial, {
      opacity: 0.3,
      duration: 0.3
    }, '<');
  
  return timeline;
};

/**
 * Hover out animation
 */
export const hoverOut = (meshRef, glowMaterial) => {
  const timeline = gsap.timeline();
  
  timeline
    .to(meshRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3,
      ease: 'power2.in'
    })
    .to(glowMaterial, {
      opacity: 0,
      duration: 0.3
    }, '<');
  
  return timeline;
};

/**
 * Click animation - Zoom to camera
 */
export const clickZoom = (meshRef, camera, onComplete) => {
  const targetPosition = meshRef.current.position.clone();
  const timeline = gsap.timeline({ onComplete });
  
  timeline
    .to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z + 5,
      duration: 1,
      ease: 'power3.inOut'
    })
    .to(meshRef.current.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 1,
      ease: 'power3.inOut'
    }, '<');
  
  return timeline;
};

/**
 * Scene entrance animation
 */
export const entranceAnimation = (meshes) => {
  const timeline = gsap.timeline();
  
  meshes.forEach((mesh, i) => {
    timeline.from(mesh.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
      delay: i * 0.05
    }, 0);
    
    timeline.from(mesh.position, {
      y: mesh.position.y - 10,
      duration: 0.8,
      ease: 'power2.out',
      delay: i * 0.05
    }, 0);
  });
  
  return timeline;
};