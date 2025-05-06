import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Save } from "lucide-react";
import { transcribeAudio } from "@/lib/ai";

interface JournalEntryProps {
  id?: string;
  title?: string;
  content?: string;
  audioUrl?: string;
  transcription?: string;
  date?: Date;
  initialData?: any;
  isEditing?: boolean;
  onSave?: (entry: {
    id?: string;
    title: string;
    content: string;
    audioUrl?: string;
    transcription?: string;
    date: Date;
  }) => void;
  onCancel?: () => void;
}

const JournalEntry = ({
  id,
  title: initialTitle = "",
  content: initialContent = "",
  audioUrl: initialAudioUrl,
  transcription: initialTranscription,
  date: initialDate = new Date(),
  initialData,
  isEditing = false,
  onSave,
  onCancel,
}: JournalEntryProps) => {
  const [title, setTitle] = useState(initialData?.title || initialTitle);
  const [content, setContent] = useState(
    initialData?.content || initialContent,
  );
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(
    initialData?.audioUrl || initialAudioUrl,
  );
  const [transcription, setTranscription] = useState(
    initialData?.transcription || initialTranscription || "",
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [date, setDate] = useState(initialDate);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        audioBlobRef.current = audioBlob;
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Automatically start transcription
        await handleTranscription(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Start timer
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setRecordingTime(elapsed);
        }
      }, 100);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop timer
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Stop all tracks on the stream
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      const transcriptionText = await transcribeAudio(audioBlob);
      if (transcriptionText) {
        setTranscription(transcriptionText);
        // If content is empty, automatically fill it with transcription
        if (!content.trim()) {
          setContent(transcriptionText);
        }
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        id,
        title,
        content,
        audioUrl,
        transcription,
        date: new Date(),
      });
    }
  };

  return (
    <Card className="w-full glass-card shadow-md border border-white/10">
      <CardHeader>
        <CardTitle>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Journal Entry Title"
            className="w-full border-none text-xl font-semibold focus:outline-none bg-transparent glass-input"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts here..."
          className="min-h-[200px] glass-input"
        />

        {audioUrl && (
          <div className="mt-4">
            <audio
              src={audioUrl}
              controls
              className="w-full glass-input rounded-md"
            />
          </div>
        )}

        {transcription && (
          <div className="mt-2">
            <h3 className="text-sm font-medium mb-1 glow-text">
              Transcription
            </h3>
            <div className="text-sm text-foreground/80 glass-card-inner p-3 rounded-md">
              {transcription}
            </div>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
            <span className="text-sm">Transcribing audio...</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <>
              <Button variant="destructive" size="sm" onClick={stopRecording}>
                <Square className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
              <span className="text-sm text-foreground/70">
                {formatTime(recordingTime)}
              </span>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={startRecording}
              className="glass-input hover:glow-border"
            >
              <Mic className="mr-2 h-4 w-4" />
              Record Audio
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="glass-input hover:glow-border"
            >
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={handleSave} className="glass-button">
            <Save className="mr-2 h-4 w-4" />
            Save Entry
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JournalEntry;
