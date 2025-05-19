import React from "react";
import JournalManagement from "@/components/journal/JournalManagement";

const JournalPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30">
      <div className="container mx-auto px-4 py-8">
        <JournalManagement />
      </div>
    </div>
  );
};

export default JournalPage;
