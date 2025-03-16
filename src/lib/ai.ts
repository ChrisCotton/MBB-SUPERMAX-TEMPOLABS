import { supabase } from "./supabase";

// AI service configuration
interface AIConfig {
  apiKey: string;
  provider: "openai" | "azure" | "anthropic" | "custom";
  endpoint?: string;
  model?: string;
}

// Get AI configuration from environment or storage
export const getAIConfig = async (): Promise<AIConfig | null> => {
  try {
    // First check if we have a stored config in Supabase
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from("user_settings")
      .select("ai_config")
      .eq("user_id", user.user.id)
      .single();

    if (data?.ai_config) {
      return data.ai_config as AIConfig;
    }

    // Fallback to environment variables
    if (import.meta.env.VITE_AI_API_KEY) {
      return {
        apiKey: import.meta.env.VITE_AI_API_KEY as string,
        provider:
          (import.meta.env.VITE_AI_PROVIDER as
            | "openai"
            | "azure"
            | "anthropic"
            | "custom") || "openai",
        endpoint: import.meta.env.VITE_AI_ENDPOINT as string,
        model: (import.meta.env.VITE_AI_MODEL as string) || "gpt-4",
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting AI config:", error);
    return null;
  }
};

// Save AI configuration to user settings
export const saveAIConfig = async (config: AIConfig): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.user.id,
      ai_config: config,
      updated_at: new Date().toISOString(),
    });

    return !error;
  } catch (error) {
    console.error("Error saving AI config:", error);
    return false;
  }
};

// Transcribe audio using the configured AI service
export const transcribeAudio = async (
  audioBlob: Blob,
): Promise<string | null> => {
  try {
    const config = await getAIConfig();
    if (!config) {
      throw new Error("AI configuration not found");
    }

    // For OpenAI
    if (config.provider === "openai") {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("model", config.model || "whisper-1");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.text;
    }

    // For Azure
    if (config.provider === "azure" && config.endpoint) {
      // Azure implementation would go here
      throw new Error("Azure transcription not yet implemented");
    }

    // For Anthropic
    if (config.provider === "anthropic") {
      // Anthropic implementation would go here
      throw new Error("Anthropic transcription not yet implemented");
    }

    // For custom endpoint
    if (config.provider === "custom" && config.endpoint) {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Custom API error: ${response.status}`);
      }

      const data = await response.json();
      return data.text || data.transcription;
    }

    throw new Error(`Unsupported AI provider: ${config.provider}`);
  } catch (error) {
    console.error("Transcription error:", error);
    return null;
  }
};

// Analyze text using the configured AI service
export const analyzeText = async (
  text: string,
  prompt: string,
): Promise<string | null> => {
  try {
    const config = await getAIConfig();
    if (!config) {
      throw new Error("AI configuration not found");
    }

    // For OpenAI
    if (config.provider === "openai") {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: config.model || "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "You are an assistant that analyzes journal entries and provides insights.",
              },
              {
                role: "user",
                content: `${prompt}\n\nJournal entry: ${text}`,
              },
            ],
            temperature: 0.7,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }

    // For Azure
    if (config.provider === "azure" && config.endpoint) {
      // Azure implementation would go here
      throw new Error("Azure analysis not yet implemented");
    }

    // For Anthropic
    if (config.provider === "anthropic") {
      // Anthropic implementation would go here
      throw new Error("Anthropic analysis not yet implemented");
    }

    // For custom endpoint
    if (config.provider === "custom" && config.endpoint) {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Custom API error: ${response.status}`);
      }

      const data = await response.json();
      return data.result || data.analysis;
    }

    throw new Error(`Unsupported AI provider: ${config.provider}`);
  } catch (error) {
    console.error("Analysis error:", error);
    return null;
  }
};

// Generate insights from journal entries
export const generateJournalInsights = async (
  entries: any[],
): Promise<any | null> => {
  try {
    const config = await getAIConfig();
    if (!config) {
      return null;
    }

    // Prepare journal entries for analysis
    const journalContent = entries
      .map(
        (entry) =>
          `Date: ${new Date(entry.createdAt).toLocaleDateString()}\nTitle: ${entry.title}\nContent: ${entry.content}\n`,
      )
      .join("\n---\n\n");

    const prompt = `Analyze these journal entries and provide insights about:
1. Common themes and patterns
2. Emotional trends
3. Progress toward goals
4. Suggestions for improvement
5. Key observations

Format your response as JSON with the following structure:
{
  "themes": [array of theme objects with name and count],
  "emotions": [array of emotion objects with name and intensity],
  "progress": {object with goal and status fields},
  "suggestions": [array of suggestion strings],
  "observations": [array of observation strings]
}`;

    // For OpenAI
    if (config.provider === "openai") {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: config.model || "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "You are an assistant that analyzes journal entries and provides structured insights in JSON format.",
              },
              {
                role: "user",
                content: `${prompt}\n\n${journalContent}`,
              },
            ],
            temperature: 0.7,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Extract JSON from the response
      try {
        // Find JSON in the response (it might be wrapped in markdown code blocks)
        const jsonMatch =
          content.match(/```json\n([\s\S]*?)\n```/) ||
          content.match(/({[\s\S]*})/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content;
        return JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Error parsing JSON from AI response:", parseError);
        return { rawResponse: content };
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating journal insights:", error);
    return null;
  }
};
