import React, { useEffect, useRef } from 'react';
import { initFXCanvas } from '../services/fxEngine';

export default function FXCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      initFXCanvas(canvasRef.current);
    }
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fx-canvas-fg" />
      <div id="flashOverlay" className="flash-overlay" aria-hidden="true" />
    </>
  );
}
