import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Image } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import TextTo3DTab from "@/components/dashboard/TextTo3DTab";
import ImageTo3DTab from "@/components/dashboard/ImageTo3DTab";
import HistorySection from "@/components/dashboard/HistorySection";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "image" ? "image" : "text";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              3D <span className="gradient-text">Generator</span>
            </h1>
            <p className="text-muted-foreground">
              Create stunning 3D models from text or images using AI.
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="glass-card w-full grid grid-cols-2 h-12">
              <TabsTrigger value="text" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Box className="w-4 h-4" />
                Text to 3D
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Image className="w-4 h-4" />
                Image to 3D
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <TextTo3DTab />
            </TabsContent>
            <TabsContent value="image">
              <ImageTo3DTab />
            </TabsContent>
          </Tabs>

          <div className="mt-12">
            <HistorySection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
