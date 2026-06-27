import Terminal from "./components/Terminal";
import CRTOverlay from "./components/CRTOverlay";

export default function App() {
  return (
    <div className="relative min-h-screen w-full bg-black">
      <Terminal />
      <CRTOverlay />
    </div>
  );
}
