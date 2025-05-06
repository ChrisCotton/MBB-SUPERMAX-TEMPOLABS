import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const AISettings = () => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [creativityLevel, setCreativityLevel] = useState([50]);
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (data && data.ai_config) {
            const config = data.ai_config;
            setAiEnabled(config.ai_enabled ?? true);
            setCreativityLevel([config.creativity_level ?? 50]);
            setAutoSuggestions(config.auto_suggestions ?? true);
            setDataSharing(config.data_sharing ?? false);
          }
        }
      } catch (error) {
        console.error("Error loading AI settings:", error);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("user_settings").upsert({
          user_id: user.id,
          ai_config: {
            ai_enabled: aiEnabled,
            creativity_level: creativityLevel[0],
            auto_suggestions: autoSuggestions,
            data_sharing: dataSharing,
          },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error saving AI settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full glass-card shadow-md border border-white/10">
      <CardHeader>
        <CardTitle className="text-xl font-semibold glow-text">
          AI Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="ai-enabled" className="flex flex-col gap-1">
            <span>Enable AI Features</span>
            <span className="text-sm text-muted-foreground">
              Use AI to enhance your mental bank experience
            </span>
          </Label>
          <Switch
            id="ai-enabled"
            checked={aiEnabled}
            onCheckedChange={setAiEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="creativity-level">
            Creativity Level: {creativityLevel[0]}%
          </Label>
          <Slider
            id="creativity-level"
            disabled={!aiEnabled}
            value={creativityLevel}
            onValueChange={setCreativityLevel}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Practical</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="auto-suggestions" className="flex flex-col gap-1">
            <span>Auto Suggestions</span>
            <span className="text-sm text-muted-foreground">
              Receive AI-powered task and category suggestions
            </span>
          </Label>
          <Switch
            id="auto-suggestions"
            disabled={!aiEnabled}
            checked={autoSuggestions}
            onCheckedChange={setAutoSuggestions}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="data-sharing" className="flex flex-col gap-1">
            <span>Contribute Anonymous Data</span>
            <span className="text-sm text-muted-foreground">
              Help improve AI features by sharing anonymous usage data
            </span>
          </Label>
          <Switch
            id="data-sharing"
            checked={dataSharing}
            onCheckedChange={setDataSharing}
          />
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="w-full mt-4 glass-button"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AISettings;
