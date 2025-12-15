import React, { useEffect, useState } from 'react';
import { VisualEvent, Particle } from '../types';

interface Props {
  data: VisualEvent;
  onComplete: (id: string) => void;
}

const VisualEventDisplay: React.FC<Props> = ({ data, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles on mount
    const newParticles: Particle[] = [];
    const count = 12; // Number of particles in explosion
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 10 + Math.random() * 10;
      newParticles.push({
        id: `${data.id}-p-${i}`,
        parentId: data.id,
        x: 0, // Relative to center of parent
        y: 0,
        color: data.color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
    setParticles(newParticles);

    // Self cleanup
    const timer = setTimeout(() => {
      onComplete(data.id);
    }, 1500);

    return () => clearTimeout(timer);
  }, [data, onComplete]);

  // Style for the main letter container
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${data.x}%`,
    top: `${data.y}%`,
    transform: `translate(-50%, -50%) rotate(${data.rotation}deg)`,
    zIndex: 20,
  };

  return (
    <div style={containerStyle} className="pointer-events-none">
      {/* Main Letter Pop */}
      <div 
        className="animate-pop-in flex items-center justify-center font-bold text-white drop-shadow-lg"
        style={{ 
          fontSize: `${data.size}rem`,
          color: data.color,
          textShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}
      >
        {renderShapeOrText(data)}
      </div>

      {/* Explosion Particles */}
      {particles.map((p, i) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: '16px',
            height: '16px',
            backgroundColor: p.color,
            left: 0,
            top: 0,
            transform: `translate(${p.vx * 15}px, ${p.vy * 15}px)`, // Simple CSS animation simulation position
            opacity: 0,
            transition: 'transform 1s cubic-bezier(0,0,0.2,1), opacity 1s ease-out',
            animation: 'float-up 1s ease-out forwards', // Re-using global keyframe for simplicity
            animationDelay: `${i * 0.02}s`
          }}
        />
      ))}
    </div>
  );
};

function renderShapeOrText(data: VisualEvent) {
  // If the key is a special character or space, show a shape icon
  // Otherwise show the character
  if (data.key.length > 1) {
    // Render shape SVG
    return <ShapeIcon type={data.shape} />;
  }
  return data.key.toUpperCase();
}

const ShapeIcon: React.FC<{ type: string }> = ({ type }) => {
  const size = "1em";
  switch (type) {
    case 'circle':
      return <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: 'currentColor' }} />;
    case 'square':
      return <div style={{ width: size, height: size, borderRadius: '10%', backgroundColor: 'currentColor' }} />;
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    default: // Triangle
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
      );
  }
};

export default VisualEventDisplay;
