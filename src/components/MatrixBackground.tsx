import { useEffect, useRef } from "react";

interface MatrixBackgroundProps {
  active: boolean;
  opacity?: number;
}

export default function MatrixBackground({ active, opacity = 0.15 }: MatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Characters
    const chars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charArr = chars.split("");
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize) + 1;

    // Tracking positions
    const yPositions = Array(columns).fill(0).map(() => Math.floor(Math.random() * -canvas.height / fontSize));

    const draw = () => {
      // Semi-transparent background to create trail effect
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0f0"; // Matrix green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < yPositions.length; i++) {
        // Pick random character
        const char = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = yPositions[i] * fontSize;

        // Draw character
        ctx.fillText(char, x, y);

        // Reset if it goes off bottom or randomly
        if (y > canvas.height && Math.random() > 0.975) {
          yPositions[i] = 0;
        } else {
          yPositions[i]++;
        }
      }
    };

    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      id="matrix-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
      style={{ opacity }}
    />
  );
}
