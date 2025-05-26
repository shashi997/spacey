import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, useTexture} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

  

const RotatingEarth = () => {
  const meshRef = useRef();
  const earthTexture = useTexture('/textures/2k_earth_daymap.webp');

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Increased rotation speed
      meshRef.current.rotation.y += delta * 0.08; // Faster Y-axis rotation (spin)
      meshRef.current.rotation.x += delta * 0.02; // Optional: Faster X-axis rotation (axial tilt wobble)
    }
  });

  return (
    // Slightly reduced scale to help ensure it fits well within the view
    <mesh ref={meshRef} scale={1.80} position={[0, 0, 0]}> {/* Adjusted scale, ensure position is centered if needed */}
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={earthTexture}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
};

  
  // Component for subtle camera animation
  const AnimatedCamera = () => {
    const { camera } = useThree();
    // Store initial camera position to base animations off it, preventing drift if component re-mounts.
    const initialCameraPosition = useRef(new THREE.Vector3().copy(camera.position)); 
  
    useFrame((state, delta) => {
      // Subtle circular/elliptical motion
      const time = state.clock.elapsedTime;
      camera.position.x = initialCameraPosition.current.x + Math.sin(time * 0.07) * 0.15;
      camera.position.y = initialCameraPosition.current.y + Math.cos(time * 0.05) * 0.1;
      // Adjusted lookAt to target the center of the sphere (0,0,0)
      camera.lookAt(0, 0.1, 0);
    });
    return null; // This component doesn't render anything itself
  };
  
  
  const CosmicVisual = () => {
    const ambientLightRef = useRef();
    const pointLight1Ref = useRef();
    const pointLight2Ref = useRef();
  
    // This useEffect handles the fade-in animation of the lights.
    // The final brightness is determined by the intensity props on the light components below.
    useEffect(() => {
      if (ambientLightRef.current && pointLight1Ref.current && pointLight2Ref.current) {
        const tl = gsap.timeline();
        tl.from(ambientLightRef.current, {
          intensity: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        })
        .from([pointLight1Ref.current, pointLight2Ref.current], {
          intensity: 0,
          duration: 2,
          ease: 'power2.inOut',
          stagger: 0.2,
        }, "-=1.0");
      }
    }, []);
  
    return (
      <div
        className="w-full h-64 md:h-80 lg:h-96 relative"
        style={{ pointerEvents: 'none' }}
      > 
        <Canvas camera={{ position: [0, 0.4, 4.5], fov: 50 }}> {/* Slightly adjusted camera Y position */}
          {/* Further increased ambient light intensity for overall brightness */}
          <ambientLight ref={ambientLightRef} intensity={1.1} />
          {/* Hemisphere light for softer fill */}
          <hemisphereLight skyColor="#a1a8f8" groundColor="#5348ca" intensity={0.5} />

          {/* Further increased point light intensities */}
          <pointLight ref={pointLight1Ref} position={[4, 2.5, 4]} intensity={1.8} color="#e8e0ff" distance={20} decay={1.2}/>
          <pointLight ref={pointLight2Ref} position={[-4, -1.5, -3.5]} intensity={1.6} color="#d5c4ff" distance={18} decay={1.2}/>

          <Stars radius={120} depth={50} count={2500} factor={4} saturation={0.1} fade speed={0.7} />
          <RotatingEarth />
          <AnimatedCamera />
        </Canvas>
      </div>
    );
  };
  

export default CosmicVisual;
