import React, { useEffect, useRef } from 'react';

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const columns = Math.floor(width / 20);
    const drops: number[] = new Array(columns).fill(1);

    const matrixChars = "SUPLOCK01PROTOCOLDEFISUPRAL1DAOVAULT";

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00FF41';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    let animationId = setInterval(draw, 50);

    const handleResize = () => {
      width = (canvas.width = window.innerWidth);
      height = (canvas.height = window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-20"
      style={{ filter: 'blur(1px)' }}
    />
  );
};

export default MatrixBackground;
