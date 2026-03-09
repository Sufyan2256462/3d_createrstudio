import { useState, useEffect } from "react";
import { Clock, Box, Image, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HistoryItem {
  id: number;
  type: "text" | "image";
  prompt: string;
  style?: string;
  modelUrl: string;
  createdAt: string;
}

const HistorySection = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("model-history") || "[]");
    setHistory(stored);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("model-history");
    setHistory([]);
    toast.success("History cleared");
  };

  if (history.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No generation history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">History</h3>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
      <div className="grid gap-3">
        {history.map((item) => (
          <div key={item.id} className="glass-card-hover p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {item.type === "text" ? (
                <Box className="w-5 h-5 text-primary" />
              ) : (
                <Image className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.prompt}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()} · {item.type === "text" ? "Text" : "Image"} to 3D
                {item.style && ` · ${item.style}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySection;
