import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Wand2, Download, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ModelViewer from "./ModelViewer";

const ImageTo3DTab = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const proxyModelUrl = async (originalUrl: string): Promise<string> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const res = await fetch(`${supabaseUrl}/functions/v1/proxy-glb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ url: originalUrl }),
    });
    if (!res.ok) throw new Error('Failed to proxy model');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  };

  const pollTaskStatus = useCallback(async (taskId: string): Promise<{ model_url?: string; model_base64?: string; demo?: boolean }> => {
    const maxAttempts = 60;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 3000));
      
      const { data, error } = await supabase.functions.invoke('check-task', {
        body: { task_id: taskId },
      });

      if (error) throw new Error(error.message);
      
      if (data?.status === 'success') {
        return data;
      }
      if (data?.status === 'failed') {
        throw new Error(data?.error || 'Generation failed');
      }
      
      // Update progress
      setProgress(data?.progress || Math.min(90, (i / maxAttempts) * 100));
    }
    throw new Error('Generation timed out');
  }, []);

  const handleGenerate = async () => {
    if (!imageBase64) {
      toast.error("Please upload an image first");
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      const { data, error } = await supabase.functions.invoke('image-to-3d', {
        body: { image: imageBase64 },
      });

      if (error) throw new Error(error.message);

      // Demo mode - immediate result
      if (data?.demo && data?.model_url) {
        setModelUrl(data.model_url);
        toast.info("Demo mode: showing a sample 3D model. Add a valid API key for real generation.");
        saveToHistory(data.model_url);
        toast.success("3D model generated successfully!");
        setLoading(false);
        return;
      }

      // Async mode - poll for result
      if (data?.status === 'processing' && data?.task_id) {
        toast.info("Generation started! This may take 1-2 minutes...");
        const result = await pollTaskStatus(data.task_id);
        
        let finalUrl: string | undefined;
        if (result.model_url) {
          finalUrl = await proxyModelUrl(result.model_url);
        }
        
        if (!finalUrl) throw new Error('No model URL returned');
        setModelUrl(finalUrl);
        saveToHistory(finalUrl);
        toast.success("3D model generated successfully!");
        return;
      }

      throw new Error(data?.error || 'Unexpected response');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || "Failed to generate 3D model.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const saveToHistory = (url: string) => {
    const history = JSON.parse(localStorage.getItem("model-history") || "[]");
    history.unshift({
      id: Date.now(),
      type: "image",
      prompt: "Image to 3D",
      modelUrl: url,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("model-history", JSON.stringify(history.slice(0, 20)));
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Upload Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-contain rounded-lg bg-muted/30"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
              >
                <span className="text-sm text-foreground">Change image</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Click to upload</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
            </button>
          )}
        </div>

        <Button
          variant="hero"
          className="w-full"
          onClick={handleGenerate}
          disabled={loading || !imageBase64}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {progress > 0 ? `Generating... ${Math.round(progress)}%` : 'Starting...'}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate 3D from Image
            </>
          )}
        </Button>
      </div>

      <ModelViewer modelUrl={modelUrl} />

      {modelUrl && (
        <Button variant="hero-outline" className="w-full" asChild>
          <a href={modelUrl} download="model.glb">
            <Download className="w-4 h-4 mr-2" />
            Download .glb Model
          </a>
        </Button>
      )}
    </div>
  );
};

export default ImageTo3DTab;
