import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Mic, MicOff, Save, Trash2, Play, Pause, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  content: z.string().min(1, { message: "Journal content is required" }),
});

interface JournalEntryProps {
  onSave: (data: {
    title: string;
    content: string;
    audioUrl?: string;
    transcription?: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    content: string;
    audioUrl?: string;
    transcription?: string;
  };
  isEditing?: boolean;
}

const JournalEntry = ({
  onSave,
  onCancel,
  initialData,
  isEditing = false,
}: JournalEntryProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(
    initialData?.audioUrl,
  );
  const [transcription, setTranscription] = useState<string | undefined>(
    initialData?.transcription,
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // References for recording
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
    },
  });

  // Format recording time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Create audio element for playback
        if (audioRef.current) {
          audioRef.current.src = url;
        }

        // Transcribe the audio
        transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start timer
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        "Could not access microphone. Please ensure you have granted permission.",
      );
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });
      setIsRecording(false);

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Transcribe audio using AI service
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setError(null);

      // First try to use the AI transcription service
      const aiTranscription = await import("@/lib/ai")
        .then(({ transcribeAudio }) => transcribeAudio(audioBlob))
        .catch((err) => {
          console.error("Error importing AI module:", err);
          return null;
        });

      if (aiTranscription) {
        setTranscription(aiTranscription);

        // Optionally update the content field with the transcription
        if (!form.getValues().content) {
          form.setValue("content", aiTranscription);
        }
        return;
      }

      // Fallback to simulated transcription if AI service is not available
      setError(
        "AI transcription service not available. Using simulated transcription instead.",
      );
      setTimeout(() => {
        const simulatedTranscription =
          "This is a simulated transcription. To enable real transcription, please configure your AI API key in settings.";
        setTranscription(simulatedTranscription);

        // Optionally update the content field with the transcription
        if (!form.getValues().content) {
          form.setValue("content", simulatedTranscription);
        }

        setError(null);
      }, 1500);
    } catch (err) {
      console.error("Error transcribing audio:", err);
      setError("Failed to transcribe audio. Please try again.");
    }
  };

  // Toggle audio playback
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  // Handle audio playback events
  React.useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    if (audioUrl) {
      audio.src = audioUrl;
    }

    audio.onended = () => {
      setIsPlaying(false);
    };

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [isRecording]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      title: values.title,
      content: values.content,
      audioUrl,
      transcription,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Journal Entry" : "New Journal Entry"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a title for your journal entry"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>Voice Recording</FormLabel>
                <div className="flex items-center gap-2">
                  {isRecording ? (
                    <Badge variant="destructive" className="animate-pulse">
                      Recording {formatTime(recordingTime)}
                    </Badge>
                  ) : audioUrl ? (
                    <Badge variant="outline">Recording Available</Badge>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {isRecording ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={stopRecording}
                    className="flex items-center gap-1"
                  >
                    <MicOff className="h-4 w-4" />
                    Stop Recording
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startRecording}
                    className="flex items-center gap-1"
                  >
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </Button>
                )}

                {audioUrl && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={togglePlayback}
                      className="flex items-center gap-1"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Play Recording
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAudioUrl(undefined);
                        setTranscription(undefined);
                        if (audioRef.current) {
                          audioRef.current.src = "";
                        }
                      }}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Recording
                    </Button>
                  </>
                )}
              </div>

              {transcription && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Transcription:</p>
                  <p className="text-sm">{transcription}</p>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your thoughts, insights, or reflections..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          Save Entry
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JournalEntry;
