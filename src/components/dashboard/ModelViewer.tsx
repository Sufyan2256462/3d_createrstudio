import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ModelViewerProps {
  modelUrl: string | null;
}

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const ModelViewer = ({ modelUrl }: ModelViewerProps) => {
  const [loadError, setLoadError] = useState(false);
  const [key, setKey] = useState(0);

  // Reset error state when URL changes
  useEffect(() => {
    if (modelUrl) {
      setLoadError(false);
      setKey(prev => prev + 1);
    }
  }, [modelUrl]);

  if (!modelUrl) {
    return (
      <div className="w-full h-80 glass-card flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm">Your 3D model will appear here</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-80 glass-card flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-sm font-medium">Failed to load 3D model</p>
          <p className="text-muted-foreground text-xs mt-1">The model file could not be rendered</p>
          <button
            onClick={() => { setLoadError(false); setKey(prev => prev + 1); }}
            className="mt-3 text-xs text-primary underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80 glass-card overflow-hidden rounded-xl">
      <Canvas
        key={key}
        camera={{ position: [0, 0, 2], fov: 50 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          const handleContextLost = (e: Event) => {
            e.preventDefault();
            console.warn('WebGL context lost, attempting to recover...');
            setKey(prev => prev + 1);
          };
          gl.domElement.addEventListener('webglcontextlost', handleContextLost);
        }}
      >
        <Suspense
          fallback={null}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Model url={modelUrl} />
          <OrbitControls autoRotate autoRotateSpeed={2} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Suspense fallback={<Loader2 className="w-8 h-8 text-primary animate-spin" />}>
          <></>
        </Suspense>
      </div>
    </div>
  );
};

export default ModelViewer;
