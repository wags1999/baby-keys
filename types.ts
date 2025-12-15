export type ShapeType = 'circle' | 'square' | 'star' | 'heart' | 'triangle';

export interface VisualEvent {
  id: string;
  key: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  color: string;
  shape: ShapeType;
  rotation: number;
  size: number;
}

export interface Particle {
  id: string;
  parentId: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
}
