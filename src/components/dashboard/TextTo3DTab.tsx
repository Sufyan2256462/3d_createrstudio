import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ModelViewer from "./ModelViewer";

const TextTo3DTab = () => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [loading, setLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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

  const pollTaskStatus = useCallback(async (taskId: string): Promise<{ model_url?: string; model_base64?: string }> => {
    const maxAttempts = 60;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 3000));
      
      const { data, error } = await supabase.functions.invoke('check-task', {
        body: { task_id: taskId },
      });

      if (error) throw new Error(error.message);
      
      if (data?.status === 'success') return data;
      if (data?.status === 'failed') throw new Error(data?.error || 'Generation failed');
      
      setProgress(data?.progress || Math.min(90, (i / maxAttempts) * 100));
    }
    throw new Error('Generation timed out');
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-3d', {
        body: { prompt: `${prompt} style:${style}` },
      });

      if (error) throw new Error(error.message);

      // Demo mode
      if (data?.demo && data?.model_url) {
        setModelUrl(data.model_url);
        toast.info("Demo mode: showing a sample 3D model. Add a valid API key for real generation.");
        saveToHistory(data.model_url);
        toast.success("3D model generated successfully!");
        setLoading(false);
        return;
      }

      // Async mode
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
      type: "text",
      prompt,
      style,
      modelUrl: url,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("model-history", JSON.stringify(history.slice(0, 20)));
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Prompt</label>
          <div className="relative">
            <Textarea
              placeholder="Describe the 3D model you want to generate... (e.g., 'A futuristic robot with glowing eyes')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-muted/50 border-border/50 resize-none"
            />
            {prompt && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={copyPrompt}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Style</label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="bg-muted/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realistic">Realistic</SelectItem>
              <SelectItem value="cartoon">Cartoon</SelectItem>
              <SelectItem value="low-poly">Low Poly</SelectItem>
              <SelectItem value="game-asset">Game Asset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="hero"
          className="w-full"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {progress > 0 ? `Generating... ${Math.round(progress)}%` : 'Starting...'}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate 3D Model
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

export default TextTo3DTab;
