import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const VisionBoard = () => {
  return (
    <div className="bg-background p-4 rounded-lg">
      <Card className="glass-card shadow-md border border-white/10">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 glow-text">Vision Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder for vision board items */}
            <div className="aspect-square bg-accent/20 rounded-lg flex items-center justify-center border border-white/10">
              <p className="text-center text-muted-foreground">
                Add your vision items here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisionBoard;
