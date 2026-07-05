'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import * as THREE from 'three';

function CoinMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Rotate and wobble on hover/mouse move
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth continuous rotation
    const speed = hovered ? 2.5 : 1.0;
    meshRef.current.rotation.y += 0.01 * speed;
    
    // Add a gentle wobble
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.15;
    
    // Track mouse influence
    const targetX = (state.pointer.x * Math.PI) / 6;
    const targetY = (state.pointer.y * Math.PI) / 6;
    meshRef.current.rotation.x += (targetY - meshRef.current.rotation.x) * 0.1;
    meshRef.current.rotation.z += (targetX - meshRef.current.rotation.z) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      {/* Coin Shape: thin cylinder */}
      <cylinderGeometry args={[2.2, 2.2, 0.25, 64]} />
      
      {/* Metallic Cyberpunk Coin Material */}
      <meshStandardMaterial
        color="#00F5FF" // Vision Cyan
        metalness={0.9}
        roughness={0.15}
        emissive="#7C3AED" // Vision Purple glow from edges
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

export default function ThreeCoin() {
  return (
    <div className="w-full h-[400px] md:h-[450px] relative">
      {/* Subtle Background Glow behind the coin */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.08)_0%,transparent_60%)] pointer-events-none" />
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        
        {/* Glowing lights for highlights */}
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00F5FF" />
        <pointLight position={[-10, -10, -10]} intensity={1.0} color="#7C3AED" />
        <directionalLight position={[0, 5, 2]} intensity={1.2} color="#ffffff" castShadow />
        
        <Center>
          {/* Rotate model 90 deg so face points forward */}
          <group rotation={[Math.PI / 2, 0, 0]}>
            <CoinMesh />
          </group>
        </Center>
      </Canvas>
    </div>
  );
}
