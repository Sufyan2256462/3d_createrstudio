import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/40 backdrop-blur-xl">
      <div className="container px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Box className="w-6 h-6 text-primary" />
          <span className="font-display text-lg font-bold">AI 3D Studio</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
        </div>
        <Button variant="hero" size="sm" onClick={() => navigate("/dashboard")}>
          Get Started
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
