/* eslint-disable react/no-unknown-property */
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, MathUtils } from 'three';

const STATES = {
  idle: {
    core: '#8EC5FF',
    glow: '#55DDE0',
    accent: '#F5F8FF',
    distort: 0.2,
    speed: 1.1,
    scale: 1,
  },
  listening: {
    core: '#55DDE0',
    glow: '#8EC5FF',
    accent: '#FFFFFF',
    distort: 0.44,
    speed: 2.2,
    scale: 1.06,
  },
  thinking: {
    core: '#7C6DF2',
    glow: '#55DDE0',
    accent: '#DDE7F6',
    distort: 0.34,
    speed: 1.55,
    scale: 0.96,
  },
  speaking: {
    core: '#F0B38A',
    glow: '#7C6DF2',
    accent: '#F5F8FF',
    distort: 0.58,
    speed: 2.55,
    scale: 1.08,
  },
  calming: {
    core: '#87C4A3',
    glow: '#55DDE0',
    accent: '#F5F8FF',
    distort: 0.24,
    speed: 0.78,
    scale: 1.02,
  },
};

function AudioRing({ index, state, level }) {
  const ref = useRef(null);
  const config = STATES[state] ?? STATES.idle;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pulse = Math.sin(t * (config.speed + index * 0.28) + index) * 0.045;
    const intensity = state === 'idle' ? 0.08 : 0.22 + level * 0.34;
    const scale = 1 + pulse + intensity + index * 0.115;

    ref.current.scale.setScalar(MathUtils.lerp(ref.current.scale.x, scale, 0.08));
    ref.current.rotation.z += 0.002 + index * 0.0007;
    ref.current.material.opacity = MathUtils.lerp(
      ref.current.material.opacity,
      0.16 + level * 0.24 - index * 0.022,
      0.08,
    );
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2.08, 0, index * 0.42]}>
      <torusGeometry args={[1.32 + index * 0.22, 0.0065, 12, 180]} />
      <meshBasicMaterial
        color={index % 2 ? config.accent : config.glow}
        transparent
        opacity={0.14}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function CoreMesh({ state, level }) {
  const groupRef = useRef(null);
  const coreRef = useRef(null);
  const glowRef = useRef(null);
  const config = STATES[state] ?? STATES.idle;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const activeLevel = state === 'idle' ? 0.08 : level;
    const pulse = Math.sin(t * config.speed * 1.4) * 0.045 + activeLevel * 0.24;
    const targetScale = config.scale + pulse;

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0025 + activeLevel * 0.006;
      groupRef.current.rotation.x = Math.sin(t * 0.42) * 0.09;
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(MathUtils.lerp(coreRef.current.scale.x, targetScale, 0.09));
      coreRef.current.rotation.z += 0.004 + activeLevel * 0.008;
    }

    if (glowRef.current) {
      const glowScale = 1.38 + Math.sin(t * 1.15) * 0.055 + activeLevel * 0.22;
      glowRef.current.scale.setScalar(MathUtils.lerp(glowRef.current.scale.x, glowScale, 0.08));
      glowRef.current.material.opacity = MathUtils.lerp(
        glowRef.current.material.opacity,
        0.18 + activeLevel * 0.2,
        0.08,
      );
    }
  });

  const rings = useMemo(() => [0, 1, 2, 3], []);

  return (
    <group ref={groupRef}>
      <Float speed={1.45} rotationIntensity={0.22} floatIntensity={0.48}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.08, 32]} />
          <MeshDistortMaterial
            color={config.core}
            emissive={config.glow}
            emissiveIntensity={0.65 + level * 0.75}
            roughness={0.22}
            metalness={0.2}
            distort={config.distort + level * 0.22}
            speed={config.speed}
          />
        </mesh>
        <mesh ref={glowRef}>
          <sphereGeometry args={[1.12, 64, 64]} />
          <meshBasicMaterial
            color={config.glow}
            transparent
            opacity={0.22}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Float>

      {rings.map((item) => (
        <AudioRing key={item} index={item} state={state} level={level} />
      ))}
      <Sparkles
        count={42}
        color={config.accent}
        scale={[4.6, 2.3, 2.3]}
        size={1.8}
        speed={0.24 + level * 0.8}
        opacity={0.36}
      />
    </group>
  );
}

export default function EmotionalCore({ state = 'idle', level = 0, compact = false, className = '' }) {
  return (
    <div
      className={[
        'relative isolate overflow-hidden rounded-[2rem]',
        compact ? 'h-[280px] sm:h-[340px]' : 'h-[420px] sm:h-[520px] lg:h-[620px]',
        className,
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-8 rounded-full bg-aqua/16 blur-3xl" />
      <Canvas
        camera={{ position: [0, 0, 5], fov: 38 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.88} />
        <pointLight position={[-3.2, 2.8, 3]} intensity={14} color="#55DDE0" />
        <pointLight position={[3.6, -2.2, 2.5]} intensity={10} color="#F0B38A" />
        <pointLight position={[1.5, 2.4, 3.5]} intensity={8} color="#7C6DF2" />
        <CoreMesh state={state} level={Math.max(0, Math.min(1, level))} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-10 bottom-8 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
    </div>
  );
}
