import React, { useEffect, useRef } from 'react';
import { initBackgroundCanvas } from '../services/backgroundEngine';

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      initBackgroundCanvas(canvasRef.current);
    }
  }, []);

  return <canvas ref={canvasRef} className="fx-canvas-bg" />;
}
