import { motion } from "framer-motion";
import { Box, Zap, Download, Palette } from "lucide-react";

const features = [
  {
    icon: Box,
    title: "Text to 3D",
    description: "Describe your 3D model in words and watch it come to life with AI-powered generation.",
  },
  {
    icon: Palette,
    title: "Image to 3D",
    description: "Upload any image and our AI will convert it into a detailed 3D model automatically.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate production-ready 3D assets in seconds, not hours. Perfect for rapid prototyping.",
  },
  {
    icon: Download,
    title: "Export Ready",
    description: "Download your models in .glb format, ready for use in games, AR/VR, and 3D applications.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to create stunning 3D models from text and images.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
