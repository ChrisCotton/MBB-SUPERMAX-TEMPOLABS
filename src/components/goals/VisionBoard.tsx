import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface VisionItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
}

interface VisionBoardProps {
  boardId?: string;
}

export const VisionBoard = ({ boardId }: VisionBoardProps) => {
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVisionItems();
  }, [boardId]);

  const fetchVisionItems = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        setError("You must be logged in to view vision items");
        return;
      }

      let query = supabase
        .from("vision_boards")
        .select("*")
        .eq("user_id", user.user.id);

      if (boardId) {
        query = query.eq("id", boardId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setVisionItems(data || []);
    } catch (err: any) {
      console.error("Error fetching vision items:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load vision items: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error("User not authenticated");

      const fileExt = (selectedFile as File).name
        ? (selectedFile as File).name.split(".").pop()
        : "png";
      const fileName = `${user.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `vision-boards/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("vision-board-images")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("vision-board-images")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Error uploading image:", err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const addVisionItem = async () => {
    try {
      if (!newItemTitle.trim()) {
        toast({
          title: "Error",
          description: "Please enter a title for your vision item",
          variant: "destructive",
        });
        return;
      }

      if (!selectedFile) {
        toast({
          title: "Error",
          description: "Please select an image",
          variant: "destructive",
        });
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to add vision items",
          variant: "destructive",
        });
        return;
      }

      // Upload image first
      const imageUrl = await uploadImage();
      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }

      // Save vision item to database
      const { data, error } = await supabase
        .from("vision_boards")
        .insert([
          {
            user_id: user.user.id,
            title: newItemTitle,
            description: newItemDescription || null,
            image_url: imageUrl,
          },
        ])
        .select();

      if (error) throw error;

      // Reset form
      setNewItemTitle("");
      setNewItemDescription("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsAddingItem(false);

      toast({
        title: "Success",
        description: "Vision item added successfully",
      });

      // Refresh vision items
      fetchVisionItems();
    } catch (err: any) {
      console.error("Error adding vision item:", err);
      toast({
        title: "Error",
        description: `Failed to add vision item: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteVisionItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("vision_boards")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setVisionItems(visionItems.filter((item) => item.id !== id));

      toast({
        title: "Success",
        description: "Vision item deleted successfully",
      });
    } catch (err: any) {
      console.error("Error deleting vision item:", err);
      toast({
        title: "Error",
        description: `Failed to delete vision item: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const cancelAddItem = () => {
    setIsAddingItem(false);
    setNewItemTitle("");
    setNewItemDescription("");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-transparent p-4 rounded-lg">
      <Card className="glass-card shadow-md border border-white/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold glow-text">Vision Board</h2>
            <Button
              onClick={() => setIsAddingItem(true)}
              className="glass-button"
              disabled={isAddingItem}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vision Item
            </Button>
          </div>

          {isAddingItem && (
            <div className="mb-6 p-4 glass-card-inner rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Vision Item</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelAddItem}
                  className="glass-button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Enter a title for your vision"
                    className="glass-input"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    placeholder="Describe your vision"
                    className="glass-input"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image</Label>
                  <div className="mt-1">
                    {previewUrl ? (
                      <div className="relative w-full aspect-video mb-2">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="rounded-md object-cover w-full h-full"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-80"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center border-2 border-dashed border-white/10 rounded-md p-6 glass-input">
                        <label className="flex flex-col items-center cursor-pointer">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload an image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={addVisionItem}
                    disabled={
                      isUploading || !selectedFile || !newItemTitle.trim()
                    }
                    className="glass-button"
                  >
                    {isUploading
                      ? `Uploading ${uploadProgress}%`
                      : "Save Vision Item"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : visionItems.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="aspect-square bg-accent/20 rounded-lg flex flex-col items-center justify-center border border-white/10 p-4">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Your vision board is empty. Add your first vision item to get
                  started.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visionItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group overflow-hidden rounded-lg"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-medium text-lg">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-white/80 text-sm mt-1">
                        {item.description}
                      </p>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteVisionItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add new item button as a card */}
              <div
                className="aspect-square glass-card-inner rounded-lg flex flex-col items-center justify-center border border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsAddingItem(true)}
              >
                <PlusCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground">
                  Add New Vision Item
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VisionBoard;
