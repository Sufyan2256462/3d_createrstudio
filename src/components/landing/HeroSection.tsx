import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, Image, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.png";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="container relative z-10 px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered 3D Generation</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Generate 3D Models from{" "}
            <span className="gradient-text">Text or Images</span>{" "}
            Instantly
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Transform your ideas into stunning 3D models using advanced AI. Simply describe what you want or upload an image — get production-ready 3D assets in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/dashboard?tab=text")}
            >
              <Box className="w-5 h-5 mr-2" />
              Generate from Text
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="hero-outline"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/dashboard?tab=image")}
            >
              <Image className="w-5 h-5 mr-2" />
              Generate from Image
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
