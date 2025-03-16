import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wand2, Save, AlertCircle, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAIConfig, saveAIConfig } from "@/lib/ai";

const formSchema = z.object({
  provider: z.enum(["openai", "azure", "anthropic", "custom"]),
  apiKey: z.string().min(1, { message: "API key is required" }),
  endpoint: z.string().optional(),
  model: z.string().optional(),
});

const AISettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "openai",
      apiKey: "",
      endpoint: "",
      model: "gpt-4",
    },
  });

  // Load existing AI configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const config = await getAIConfig();
        if (config) {
          form.reset({
            provider: config.provider,
            apiKey: config.apiKey,
            endpoint: config.endpoint || "",
            model: config.model || getDefaultModel(config.provider),
          });
        }
      } catch (err) {
        console.error("Error loading AI config:", err);
        setError("Failed to load AI configuration");
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const success = await saveAIConfig({
        provider: values.provider,
        apiKey: values.apiKey,
        endpoint: values.endpoint,
        model: values.model,
      });

      if (success) {
        setSuccess("AI configuration saved successfully");
      } else {
        setError("Failed to save AI configuration");
      }
    } catch (err) {
      console.error("Error saving AI config:", err);
      setError("An error occurred while saving AI configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const providerRequiresEndpoint =
    form.watch("provider") === "azure" || form.watch("provider") === "custom";

  // Get available models based on selected provider
  const getModelsForProvider = (provider: string) => {
    switch (provider) {
      case "openai":
        return [
          { value: "gpt-4", label: "GPT-4" },
          { value: "gpt-4o", label: "GPT-4o" },
          { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
          { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
          { value: "whisper-1", label: "Whisper-1 (Audio)" },
        ];
      case "azure":
        return [
          { value: "gpt-4", label: "GPT-4" },
          { value: "gpt-35-turbo", label: "GPT-3.5 Turbo" },
          { value: "whisper", label: "Whisper (Audio)" },
        ];
      case "anthropic":
        return [
          { value: "claude-3-opus", label: "Claude 3 Opus" },
          { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
          { value: "claude-3-haiku", label: "Claude 3 Haiku" },
          { value: "claude-2", label: "Claude 2" },
        ];
      case "custom":
        return [{ value: "custom-model", label: "Custom Model" }];
      default:
        return [];
    }
  };

  // Get default model for a provider
  const getDefaultModel = (provider: string) => {
    const models = getModelsForProvider(provider);
    return models.length > 0 ? models[0].value : "";
  };

  // Update model when provider changes
  useEffect(() => {
    const provider = form.watch("provider");
    const currentModel = form.watch("model");
    const availableModels = getModelsForProvider(provider);

    // Check if current model is valid for the selected provider
    const isModelValid = availableModels.some(
      (model) => model.value === currentModel,
    );

    if (!isModelValid) {
      // Set to default model for this provider
      form.setValue("model", getDefaultModel(provider));
    }
  }, [form.watch("provider")]);

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Integration Settings
        </CardTitle>
        <CardDescription>
          Configure AI services for journal transcription and analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Provider</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="azure">Azure AI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="custom">Custom API</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the AI service provider for transcription and
                    analysis
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your API key"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your API key will be securely stored and used for AI
                    requests
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {providerRequiresEndpoint && (
              <FormField
                control={form.control}
                name="endpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Endpoint</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter API endpoint URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      {form.watch("provider") === "azure"
                        ? "The Azure AI endpoint URL"
                        : "Your custom API endpoint URL"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getModelsForProvider(form.watch("provider")).map(
                        (model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    For text analysis, use models like gpt-4, gpt-3.5-turbo. For
                    audio transcription, the system will automatically use
                    whisper-1 regardless of this setting.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                AI Features Enabled by This Configuration
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                <li>
                  Automatic transcription of voice recordings in journal entries
                </li>
                <li>Sentiment analysis of journal content</li>
                <li>Theme extraction and pattern recognition</li>
                <li>Personalized insights and suggestions</li>
                <li>Progress tracking toward mental bank goals</li>
              </ul>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 border-t pt-4">
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AISettings;
