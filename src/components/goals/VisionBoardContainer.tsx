import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import VisionBoard from "./VisionBoard";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface VisionBoardItem {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
}

const VisionBoardContainer = () => {
  const [visionBoards, setVisionBoards] = useState<VisionBoardItem[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVisionBoards();
  }, []);

  const fetchVisionBoards = async () => {
    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();

      if (!user?.user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("vision_boards")
        .select("*")
        .eq("user_id", user.user.id);

      if (error) throw error;

      setVisionBoards(data || []);

      // Select the first board by default if available
      if (data && data.length > 0 && !selectedBoard) {
        setSelectedBoard(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching vision boards:", error);
      toast({
        title: "Error",
        description: "Failed to load vision boards",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewVisionBoard = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a vision board",
          variant: "destructive",
        });
        return;
      }

      const newBoardTitle = `Vision Board ${visionBoards.length + 1}`;

      const { data, error } = await supabase
        .from("vision_boards")
        .insert([
          {
            title: newBoardTitle,
            user_id: user.user.id,
            image_url:
              "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80", // Default placeholder image
            description: "My new vision board",
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setVisionBoards([...visionBoards, data[0]]);
        setSelectedBoard(data[0].id);
        toast({
          title: "Success",
          description: "New vision board created",
        });
      }
    } catch (error) {
      console.error("Error creating vision board:", error);
      toast({
        title: "Error",
        description: "Failed to create vision board",
        variant: "destructive",
      });
    }
  };

  const deleteVisionBoard = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this vision board? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("vision_boards")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const updatedBoards = visionBoards.filter((board) => board.id !== id);
      setVisionBoards(updatedBoards);

      if (selectedBoard === id) {
        setSelectedBoard(updatedBoards.length > 0 ? updatedBoards[0].id : null);
      }

      toast({
        title: "Success",
        description: "Vision board deleted",
      });
    } catch (error) {
      console.error("Error deleting vision board:", error);
      toast({
        title: "Error",
        description: "Failed to delete vision board",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vision Boards</h2>
        <Button
          onClick={createNewVisionBoard}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          New Board
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : visionBoards.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              You don't have any vision boards yet.
            </p>
            <Button
              onClick={createNewVisionBoard}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Create Your First Vision Board
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {visionBoards.map((board) => (
              <div key={board.id} className="relative">
                <Button
                  variant={selectedBoard === board.id ? "default" : "outline"}
                  onClick={() => setSelectedBoard(board.id)}
                  className="pr-8"
                >
                  {board.title}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-8 rounded-l-none hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteVisionBoard(board.id);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>

          {selectedBoard && (
            <div className="mt-6">
              <VisionBoard boardId={selectedBoard} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisionBoardContainer;
