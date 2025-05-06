import React from "react";
import JournalEntry from "@/components/journal/JournalEntry";

const JournalEntryStoryboard = () => {
  const handleSave = (entry: any) => {
    console.log("Entry saved:", entry);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Journal Entry Demo</h1>
        <JournalEntry
          onSave={handleSave}
          onCancel={() => console.log("Cancelled")}
        />
      </div>
    </div>
  );
};

export default JournalEntryStoryboard;
