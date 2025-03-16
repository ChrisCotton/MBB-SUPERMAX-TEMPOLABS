import React, { useState } from "react";
import { format, isValid } from "date-fns";
import { Edit, Trash2, Play, Pause, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { JournalEntryType } from "@/lib/types";

interface JournalListProps {
  entries: JournalEntryType[];
  onNewEntry: () => void;
  onEditEntry: (entry: JournalEntryType) => void;
  onDeleteEntry: (entryId: string) => void;
}

const JournalList = ({
  entries = [],
  onNewEntry,
  onEditEntry,
  onDeleteEntry,
}: JournalListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Filter entries based on search query
  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.transcription &&
        entry.transcription.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Toggle audio playback
  const togglePlayback = (entryId: string, audioUrl?: string) => {
    if (!audioUrl) return;

    if (currentlyPlaying === entryId) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => setCurrentlyPlaying(null);
      }
      setCurrentlyPlaying(entryId);
    }
  };

  // Clean up audio on unmount
  React.useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Truncate text to a certain length
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Format date safely
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);
    if (!isValid(date)) return "Date unavailable";

    return format(date, "MMM d, yyyy h:mm a");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search journal entries..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={onNewEntry} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Journal Entry
        </Button>
      </div>

      {filteredEntries.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No journal entries match your search."
                : "No journal entries yet. Start journaling to track your Mental Bank journey."}
            </p>
            {!searchQuery && (
              <Button
                onClick={onNewEntry}
                variant="outline"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Create Your First Entry
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <CardDescription>
                      {formatDate(entry.createdAt)}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditEntry(entry)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteEntry(entry.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm">{truncateText(entry.content, 150)}</p>
                {entry.transcription && (
                  <div className="mt-2">
                    <Badge variant="outline" className="mb-1">
                      Transcription
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {truncateText(entry.transcription, 100)}
                    </p>
                  </div>
                )}
              </CardContent>
              {entry.audioUrl && (
                <CardFooter className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-1"
                    onClick={() => togglePlayback(entry.id, entry.audioUrl)}
                  >
                    {currentlyPlaying === entry.id ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause Audio
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Play Audio
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalList;
