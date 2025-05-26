import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing'; // For glow effect
import * as THREE from 'three';

// This is a placeholder component.
// A real avatar would involve complex animation libraries (like Three.js, React Three Fiber, or a dedicated avatar SDK)
// and logic to synchronize animations (like lip-sync) with the spokenText.
// Component to load and display the GLTF model
function Model({ isSpeaking }) {
    const { scene, animations } = useGLTF('/models/scene.gltf');
    const modelRef = useRef();
    const mixerRef = useRef();

    useEffect(() => {
        if (scene) {
            // GLTFLoader handles textures defined in the GLTF.
            // If your model has animations, set them up here.
            if (animations && animations.length > 0) {
                mixerRef.current = new THREE.AnimationMixer(scene);
                // Example: Play the first animation by default.
                // For speaking, you'd select a specific "speaking" animation.
                const action = mixerRef.current.clipAction(animations[0]); // Or an "Idle" animation
                action.play();
            }
        }
    }, [scene, animations]);

    useFrame((state, delta) => {
        if (mixerRef.current) {
            mixerRef.current.update(delta);
        }

        // Enhanced speaking animation: smoother bobbing and slight upward movement
        if (modelRef.current) {
            const targetY = isSpeaking ? -0.95 : -1; // Slightly lift when speaking
            const bobble = isSpeaking ? Math.sin(state.clock.elapsedTime * 6) * 0.07 : 0; // More pronounced bobble

            // Smoothly interpolate to the target position
            modelRef.current.position.y = THREE.MathUtils.lerp(
                modelRef.current.position.y,
                targetY + bobble,
                0.1 // Smoothing factor
            );

            // Optional: Subtle rotation or scaling when speaking
            // const targetScale = isSpeaking ? 1.55 : 1.5;
            // modelRef.current.scale.set(targetScale, targetScale, targetScale);
        }
    });

    if (!scene) {
        console.error("GLTF scene could not be loaded. Check paths for scene.gltf and scene.bin.");
        return null;
    }

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={1.5} // Adjust as needed
            position={[0, -1, 0]} // Initial position, will be animated
            rotation={[0, Math.PI / 10, 0]} // Slight initial rotation
        />
    );
}

// Simple loading placeholder component
const LoadingPlaceholder = () => {
    return (
        <Html center>
            <div style={{
                color: 'white',
                fontSize: '1.1em',
                fontFamily: 'sans-serif',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '12px 18px',
                borderRadius: '8px',
            }}>
                Loading Avatar...
            </div>
        </Html>
    );
};
  
const Avatar = ({ isSpeaking, spokenText }) => {
    // Memoize bloom properties to prevent unnecessary re-creations
    const bloomEffect = useMemo(() => ({
        intensity: isSpeaking ? 1.8 : 0.5, // More intense glow when speaking
        luminanceThreshold: 0.25,         // Lower threshold means more parts can glow
        luminanceSmoothing: 0.3,          // Smoother falloff for the glow
        height: 350,                      // Resolution of the bloom effect
        mipmapBlur: true,                 // Softer, more diffused bloom
    }), [isSpeaking]);

    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full h-64 md:h-80 rounded-lg bg-gray-800 shadow-xl overflow-hidden border-2 border-gray-700">
                <Canvas camera={{ position: [0, 0.3, 2.8], fov: 45 }}> {/* Adjusted camera for better framing */}
                    <ambientLight intensity={0.7} />
                    <directionalLight
                        position={[4, 4, 3]}
                        intensity={2.0} // Main key light
                        castShadow
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                    />
                    <directionalLight position={[-4, 2, -3]} intensity={0.8} /> {/* Fill light */}
                    <Suspense fallback={<LoadingPlaceholder />}>
                        <Model isSpeaking={isSpeaking} />
                    </Suspense>
                    {/* OrbitControls are great for development, consider disabling/limiting for production UX */}
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false} // Usually don't want panning for an avatar
                        minDistance={1.5} // Prevent zooming too close
                        maxDistance={5}   // Prevent zooming too far
                        minPolarAngle={Math.PI / 4} // Limit looking from too far above
                        maxPolarAngle={Math.PI / 1.9} // Limit looking from too far below
                        target={[0, 0.1, 0]} // Adjust target to the model's perceived center
                    />
                    <EffectComposer>
                        <Bloom
                            intensity={bloomEffect.intensity}
                            luminanceThreshold={bloomEffect.luminanceThreshold}
                            luminanceSmoothing={bloomEffect.luminanceSmoothing}
                            height={bloomEffect.height}
                            mipmapBlur={bloomEffect.mipmapBlur}
                        />
                    </EffectComposer>
                </Canvas>
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-800">Spacey Avatar</p>
            {/* Optional: Display spoken text for debugging or as a subtitle
            {isSpeaking && spokenText && (
                <div className="mt-2 p-2 bg-gray-100 rounded-md text-sm text-gray-700 max-w-xs text-center shadow">
                    {spokenText}
                </div>
            )}
            */}
        </div>
    );
};


export default Avatar