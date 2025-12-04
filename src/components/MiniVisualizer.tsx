import { useEffect, useRef } from 'react';

interface MiniVisualizerProps {
  isPlaying: boolean;
}

const MiniVisualizer = ({ isPlaying }: MiniVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 5;
    const barWidth = canvas.width / bars - 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bars; i++) {
        const height = isPlaying 
          ? Math.random() * canvas.height * 0.8 + canvas.height * 0.2
          : canvas.height * 0.3;

        const x = i * (barWidth + 2);
        
        const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
        gradient.addColorStop(0, '#ff4444');
        gradient.addColorStop(1, '#8b0000');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - height, barWidth, height);
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={48}
      height={48}
      className="w-12 h-12 rounded"
    />
  );
};

export default MiniVisualizer;
