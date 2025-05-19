import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { JournalEntryType } from "@/lib/types";

interface JournalListProps {
  entries: JournalEntryType[];
  onEdit: (entry: JournalEntryType) => void;
  onDelete: (entryId: string) => void;
}

const JournalList: React.FC<JournalListProps> = ({
  entries,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id} className="glass-card-inner">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg glow-text">{entry.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {formatDate(entry.createdAt)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4 line-clamp-3">{entry.content}</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(entry)}
                className="glass-button"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(entry.id)}
                className="glass-button hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JournalList;
