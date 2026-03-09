import { motion } from "framer-motion";
import { MessageSquare, Cpu, Eye } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Describe or Upload",
    description: "Enter a text prompt describing your 3D model, or upload a reference image.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Generates",
    description: "Our AI processes your input and creates a detailed 3D model in seconds.",
  },
  {
    icon: Eye,
    step: "03",
    title: "Preview & Download",
    description: "View your 3D model in an interactive viewer and download it in .glb format.",
  },
];

const HowItWorksSection = () => {
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
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to transform your ideas into 3D reality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <span className="text-primary/40 font-display text-5xl font-bold absolute -top-2 left-1/2 -translate-x-1/2 -z-10">
                {step.step}
              </span>
              <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
