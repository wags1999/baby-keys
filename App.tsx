import React, { useState, useEffect, useCallback, useRef } from 'react';
import VisualEventDisplay from './components/VisualEventDisplay';
import { audioService } from './services/audioService';
import { VisualEvent, ShapeType } from './types';
import { COLORS, SHAPES } from './constants';

const App: React.FC = () => {
  const [events, setEvents] = useState<VisualEvent[]>([]);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  
  // Use a ref to prevent stale closures in event listeners if we were using them directly attached to DOM
  // But React's useEffect is fine here with dependency management.
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault(); // Prevent browser shortcuts
    
    // Resume audio context on first user interaction if needed
    if (!isStarted) {
      setIsStarted(true);
    }

    // Audio Feedback
    if (e.code === 'Space') {
      audioService.playSpaceSound();
    } else {
      audioService.playNote(e.keyCode);
    }

    // Visual Feedback Logic
    const id = Date.now().toString() + Math.random().toString();
    const isSpecialKey = e.key.length > 1;
    
    // Random Properties
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const randomX = 10 + Math.random() * 80; // Keep away from extreme edges
    const randomY = 10 + Math.random() * 80;
    const randomRotation = (Math.random() - 0.5) * 60; // -30 to 30 deg tilt
    const randomSize = isSpecialKey ? 8 : 10; // rem size

    const newEvent: VisualEvent = {
      id,
      key: e.key,
      x: randomX,
      y: randomY,
      color: randomColor,
      shape: randomShape,
      rotation: randomRotation,
      size: randomSize,
    };

    setEvents((prev) => [...prev, newEvent]);

    // Change background color slightly occasionally or on space
    if (e.code === 'Space' || Math.random() > 0.8) {
        setBackgroundIndex(prev => (prev + 1) % COLORS.length);
    }

  }, [isStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Compute background style
  // We use a dark overlay on top of the changing color to keep it not too blindingly bright, or just pastel.
  const currentBgColor = COLORS[backgroundIndex];
  // Calculate a complementary darker shade for background to make the popups stand out
  // Simple hack: use the color but with low opacity over dark gray
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden transition-colors duration-1000 ease-in-out cursor-none"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Dynamic Background Layer */}
      <div 
        className="absolute inset-0 opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: currentBgColor }}
      />
      
      {/* Floating Background Shapes for Depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-spin-slow" />
         <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
      </div>

      {/* Start Prompt Overlay */}
      {!isStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white">
          <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 animate-pulse">
            BabyKeys
          </h1>
          <p className="text-2xl mb-8">Press any key to start!</p>
          <div className="p-4 border-2 border-white rounded-xl animate-bounce">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
        </div>
      )}

      {/* Active Events Layer */}
      {events.map((event) => (
        <VisualEventDisplay 
          key={event.id} 
          data={event} 
          onComplete={removeEvent} 
        />
      ))}

      {/* Persistent Controls (Hidden for baby, visible on hover for parent in corner) */}
      <div className="absolute top-0 right-0 p-4 opacity-0 hover:opacity-100 transition-opacity z-50">
        <button 
          onClick={() => audioService.toggleMute()}
          className="bg-white text-black px-4 py-2 rounded-full shadow-lg font-bold text-sm"
        >
          Toggle Sound
        </button>
      </div>
    </div>
  );
};

export default App;
