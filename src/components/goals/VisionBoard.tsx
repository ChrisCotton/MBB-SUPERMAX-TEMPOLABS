import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { VisionBoard as VisionBoardType } from "@/lib/types";
import {
  Upload,
  Image as ImageIcon,
  Edit,
  Trash2,
  Plus,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface VisionBoardProps {
  visionBoards: VisionBoardType[];
  isLoading: boolean;
  onUpload: (file: File, title?: string, description?: string) => Promise<void>;
  onUpdate: (
    id: string,
    updates: { title?: string; description?: string },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const VisionBoard: React.FC<VisionBoardProps> = ({
  visionBoards = [],
  isLoading = false,
  onUpload = async () => {},
  onUpdate = async () => {},
  onDelete = async () => {},
}) => {
  const [activeTab, setActiveTab] = useState<"gallery" | "upload">("gallery");
  const [selectedImage, setSelectedImage] = useState<VisionBoardType | null>(
    null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<VisionBoardType | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle upload form submission
  const handleUpload = async () => {
    if (file) {
      await onUpload(file, title, description);
      // Reset form
      setFile(null);
      setPreviewUrl(null);
      setTitle("");
      setDescription("");
      setActiveTab("gallery");
    }
  };

  // Handle update form submission
  const handleUpdate = async () => {
    if (editingBoard) {
      await onUpdate(editingBoard.id, {
        title,
        description,
      });
      setEditingBoard(null);
    }
  };

  // Open edit dialog
  const openEditDialog = (board: VisionBoardType) => {
    setEditingBoard(board);
    setTitle(board.title || "");
    setDescription(board.description || "");
  };

  // Toggle fullscreen view
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading vision boards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="pt-6">
          {!visionBoards || visionBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No vision boards yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first vision board to visualize your goals
              </p>
              <Button onClick={() => setActiveTab("upload")}>
                <Upload className="h-4 w-4 mr-2" /> Upload Vision Board
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visionBoards &&
                visionBoards.map((board) => (
                  <Card
                    key={board.id}
                    className="overflow-hidden group relative"
                  >
                    <div
                      className="aspect-video bg-cover bg-center cursor-pointer"
                      style={{ backgroundImage: `url(${board.imageUrl})` }}
                      onClick={() => setSelectedImage(board)}
                    ></div>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium truncate">
                            {board.title || "Untitled Vision Board"}
                          </h3>
                          {board.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {board.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(board)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Vision Board
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this vision
                                  board? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(board.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="pt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="My Vision Board"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What this vision board represents to you..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Vision Board Image</Label>
                  <div
                    className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {previewUrl ? (
                      <div className="space-y-2">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-md"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">
                          Click to select an image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG or GIF, max 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      setTitle("");
                      setDescription("");
                      setActiveTab("gallery");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!file}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" /> Upload Vision Board
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image viewer dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent
          className={`${isFullscreen ? "max-w-[95vw] h-[95vh]" : "max-w-4xl"} p-0 overflow-hidden`}
        >
          <div className="relative">
            <img
              src={selectedImage?.imageUrl}
              alt={selectedImage?.title || "Vision Board"}
              className="w-full h-auto"
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!isFullscreen && selectedImage && (
            <div className="p-4">
              <h2 className="text-xl font-semibold">
                {selectedImage.title || "Untitled Vision Board"}
              </h2>
              {selectedImage.description && (
                <p className="mt-2 text-muted-foreground">
                  {selectedImage.description}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editingBoard}
        onOpenChange={(open) => {
          if (!open) setEditingBoard(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vision Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Vision Board"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this vision board represents to you..."
                rows={3}
              />
            </div>
            {editingBoard && (
              <div className="border rounded-md overflow-hidden">
                <img
                  src={editingBoard.imageUrl}
                  alt="Vision Board"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBoard(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisionBoard;
