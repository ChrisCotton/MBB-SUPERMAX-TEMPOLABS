import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JournalEntry from "./JournalEntry";
import JournalList from "./JournalList";
import { JournalEntryType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

const JournalManagement = () => {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryType | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("entries");

  useEffect(() => {
    // Load entries from storage or API
    // This is a placeholder for actual data loading
    const loadEntries = async () => {
      // Placeholder for API call
      const mockEntries: JournalEntryType[] = [
        {
          id: "1",
          title: "First Journal Entry",
          content: "This is my first journal entry content.",
          createdAt: new Date().toISOString(),
          userId: "user-1",
        },
        {
          id: "2",
          title: "Second Journal Entry",
          content: "Reflecting on my progress today.",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          userId: "user-1",
        },
      ];

      setEntries(mockEntries);
    };

    loadEntries();
  }, []);

  const handleSaveEntry = (entry: {
    id?: string;
    title: string;
    content: string;
    audioUrl?: string;
    transcription?: string;
    date: Date;
  }) => {
    const newEntry: JournalEntryType = {
      id: entry.id || `entry-${Date.now()}`,
      title: entry.title || "Untitled Entry",
      content: entry.content,
      audioUrl: entry.audioUrl,
      transcription: entry.transcription,
      createdAt: entry.date.toISOString(),
      userId: "user-1", // This would come from auth context in a real app
    };

    if (entry.id) {
      // Update existing entry
      setEntries(entries.map((e) => (e.id === entry.id ? newEntry : e)));
    } else {
      // Add new entry
      setEntries([newEntry, ...entries]);
    }

    setIsCreating(false);
    setSelectedEntry(null);
    setActiveTab("entries");
  };

  const handleEditEntry = (entry: JournalEntryType) => {
    setSelectedEntry(entry);
    setActiveTab("edit");
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(entries.filter((entry) => entry.id !== entryId));
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
    }
  };

  const handleCancelEdit = () => {
    setSelectedEntry(null);
    setActiveTab("entries");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight glow-text">Journal</h1>
        <Button
          onClick={() => {
            setIsCreating(true);
            setSelectedEntry(null);
            setActiveTab("create");
          }}
          className="glass-button"
        >
          New Entry
        </Button>
      </div>

      <Card className="glass-card shadow-md border border-white/10">
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="glass mb-4">
              <TabsTrigger value="entries">All Entries</TabsTrigger>
              {isCreating && (
                <TabsTrigger value="create">New Entry</TabsTrigger>
              )}
              {selectedEntry && (
                <TabsTrigger value="edit">Edit Entry</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="entries" className="space-y-4">
              {entries.length > 0 ? (
                <JournalList
                  entries={entries}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No journal entries yet. Create your first entry to get
                    started.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="create">
              <JournalEntry
                onSave={handleSaveEntry}
                onCancel={() => {
                  setIsCreating(false);
                  setActiveTab("entries");
                }}
              />
            </TabsContent>

            <TabsContent value="edit">
              {selectedEntry && (
                <JournalEntry
                  id={selectedEntry.id}
                  title={selectedEntry.title || ""}
                  content={selectedEntry.content || ""}
                  audioUrl={selectedEntry.audioUrl || ""}
                  transcription={selectedEntry.transcription || ""}
                  date={new Date(selectedEntry.createdAt)}
                  onSave={handleSaveEntry}
                  onCancel={handleCancelEdit}
                  isEditing={true}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalManagement;
