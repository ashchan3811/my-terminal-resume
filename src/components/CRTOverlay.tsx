import { useEffect, useState } from "react";

export default function CRTOverlay() {
  const [enabled, setEnabled] = useState(true);

  // Expose toggle to window for the custom shell command `crt`
  useEffect(() => {
    (window as any).toggleCRT = () => {
      setEnabled((prev) => !prev);
      return !enabled;
    };
    return () => {
      delete (window as any).toggleCRT;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      id="crt-overlay"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {/* Scanline pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)",
          backgroundSize: "100% 4px",
        }}
      />
      {/* Phosphor glow radial vignette */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          background: "radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,20,0,0.4) 100%)",
        }}
      />
    </div>
  );
}
