import { Box } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="container px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Box className="w-6 h-6 text-primary" />
              <span className="font-display text-xl font-bold">AI 3D Studio</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Generate stunning 3D models from text descriptions and images using advanced AI technology.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI 3D Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
