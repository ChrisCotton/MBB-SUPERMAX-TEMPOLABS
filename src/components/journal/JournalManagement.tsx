import React, { useState, useEffect } from "react";
import { Book, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JournalList from "./JournalList";
import JournalEntry from "./JournalEntry";
import JournalInsights from "./JournalInsights";
import { JournalEntryType } from "@/lib/types";
import { getCurrentUser } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

const JournalManagement = () => {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("entries");
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntryType | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);

  // Load journal entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        const user = await getCurrentUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setEntries(data || []);
      } catch (error) {
        console.error("Error loading journal entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Create a new journal entry
  const createEntry = async (entryData: {
    title: string;
    content: string;
    audioUrl?: string;
    transcription?: string;
  }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error("Error creating journal entry: No authenticated user");
        alert("You must be logged in to create a journal entry");
        return;
      }

      // For audio, we need to handle the blob URL differently
      // Blob URLs can't be stored directly in the database as they're temporary and browser-specific
      // In a real app, you'd upload the audio file to Supabase storage
      // For now, we'll just store a placeholder or null

      // Check if audioUrl is a blob URL and handle accordingly
      let audioUrlToStore = null;
      if (entryData.audioUrl) {
        // For demo purposes, store a placeholder instead of the blob URL
        // In a real app, you would upload the audio file to storage here
        audioUrlToStore = "audio-recording-placeholder";
      }

      console.log("Inserting journal entry with data:", {
        title: entryData.title,
        content: entryData.content,
        audio_url: audioUrlToStore,
        transcription: entryData.transcription || null,
        user_id: user.id,
      });

      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          title: entryData.title,
          content: entryData.content,
          audio_url: audioUrlToStore,
          transcription: entryData.transcription || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error creating journal entry:", error);
        throw new Error(
          `Database error: ${error.message || error.code || JSON.stringify(error)}`,
        );
      }

      if (!data) {
        console.error("No data returned from journal entry creation");
        throw new Error("Failed to create journal entry - no data returned");
      }

      // Map the database response to our frontend type
      const newEntry: JournalEntryType = {
        id: data.id,
        title: data.title,
        content: data.content,
        audioUrl: entryData.audioUrl, // Use the original audioUrl for frontend display
        transcription: data.transcription,
        createdAt: data.created_at,
        userId: data.user_id,
      };

      setEntries([newEntry, ...entries]);
      setIsEntryDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating journal entry:", error, errorMessage);
      // Show a more descriptive error message
      alert(`Failed to save journal entry: ${errorMessage}`);
    }
  };

  // Update an existing journal entry
  const updateEntry = async (entryData: {
    title: string;
    content: string;
    audioUrl?: string;
    transcription?: string;
  }) => {
    if (!currentEntry) return;

    try {
      // Handle blob URLs for audio similar to createEntry
      let audioUrlToStore = null;
      if (entryData.audioUrl) {
        // For demo purposes, store a placeholder instead of the blob URL
        audioUrlToStore = "audio-recording-placeholder";
      }

      console.log("Updating journal entry with data:", {
        title: entryData.title,
        content: entryData.content,
        audio_url: audioUrlToStore,
        transcription: entryData.transcription || null,
        id: currentEntry.id,
      });

      const { data, error } = await supabase
        .from("journal_entries")
        .update({
          title: entryData.title,
          content: entryData.content,
          audio_url: audioUrlToStore,
          transcription: entryData.transcription || null,
        })
        .eq("id", currentEntry.id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Database error: ${error.message || error.code || JSON.stringify(error)}`,
        );
      }

      // Map the database response to our frontend type
      const updatedEntry: JournalEntryType = {
        id: data.id,
        title: data.title,
        content: data.content,
        audioUrl: entryData.audioUrl, // Use the original audioUrl for frontend display
        transcription: data.transcription,
        createdAt: data.created_at,
        userId: data.user_id,
      };

      setEntries(
        entries.map((entry) =>
          entry.id === updatedEntry.id ? updatedEntry : entry,
        ),
      );
      setIsEntryDialogOpen(false);
      setCurrentEntry(null);
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error updating journal entry:", error, errorMessage);
      // Show a more descriptive error message
      alert(`Failed to update journal entry: ${errorMessage}`);
    }
  };

  // Delete a journal entry
  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", entryId);

      if (error) throw error;

      setEntries(entries.filter((entry) => entry.id !== entryId));
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  // Handle new entry button click
  const handleNewEntry = () => {
    setCurrentEntry(null);
    setIsEditing(false);
    setIsEntryDialogOpen(true);
  };

  // Handle edit entry button click
  const handleEditEntry = (entry: JournalEntryType) => {
    setCurrentEntry(entry);
    setIsEditing(true);
    setIsEntryDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsEntryDialogOpen(false);
    setCurrentEntry(null);
    setIsEditing(false);
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Journal</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entries" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Journal Entries
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="pt-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-t-primary rounded-full animate-spin"></div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <JournalList
                entries={entries}
                onNewEntry={handleNewEntry}
                onEditEntry={handleEditEntry}
                onDeleteEntry={deleteEntry}
              />
            )}
          </TabsContent>

          <TabsContent value="insights" className="pt-4">
            <JournalInsights entries={entries} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Journal Entry" : "New Journal Entry"}
            </DialogTitle>
          </DialogHeader>
          <JournalEntry
            onSave={isEditing ? updateEntry : createEntry}
            onCancel={handleDialogClose}
            initialData={currentEntry || undefined}
            isEditing={isEditing}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalManagement;
