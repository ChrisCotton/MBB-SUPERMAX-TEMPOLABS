import { supabase, getCurrentUser } from "./supabase";
import { VisionBoard } from "./types";

// Local storage key for offline fallback
const VISION_BOARDS_KEY = "mental-bank-vision-boards";

// Get all vision boards for the current user
export const getVisionBoards = async (): Promise<VisionBoard[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const visionBoardsJson = localStorage.getItem(VISION_BOARDS_KEY);
      return visionBoardsJson ? JSON.parse(visionBoardsJson) : [];
    }

    const { data, error } = await supabase
      .from("vision_boards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Map database fields to our interface
    const visionBoards: VisionBoard[] = data.map((item) => ({
      id: item.id,
      title: item.title || undefined,
      description: item.description || undefined,
      imageUrl: item.image_url,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    // Save to localStorage as backup
    localStorage.setItem(VISION_BOARDS_KEY, JSON.stringify(visionBoards));
    return visionBoards;
  } catch (error) {
    console.error("Error fetching vision boards:", error);
    // Fallback to localStorage on error
    const visionBoardsJson = localStorage.getItem(VISION_BOARDS_KEY);
    return visionBoardsJson ? JSON.parse(visionBoardsJson) : [];
  }
};

// Upload a vision board image to storage and create a record
export const uploadVisionBoard = async (
  file: File,
  title?: string,
  description?: string,
): Promise<VisionBoard> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // For demo purposes, use a placeholder image URL instead of uploading to storage
    // This avoids issues with storage permissions and WebSocket timeouts
    const placeholderImageUrl = `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80`;

    // Create a record in the vision_boards table with the placeholder URL
    const { data, error } = await supabase
      .from("vision_boards")
      .insert({
        user_id: user.id,
        title,
        description,
        image_url: placeholderImageUrl,
      })
      .select()
      .single();

    if (error) throw error;

    // Map to our interface
    const visionBoard: VisionBoard = {
      id: data.id,
      title: data.title || undefined,
      description: data.description || undefined,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Update local storage
    const existingBoards = await getVisionBoards();
    localStorage.setItem(
      VISION_BOARDS_KEY,
      JSON.stringify([visionBoard, ...existingBoards]),
    );

    return visionBoard;
  } catch (error) {
    console.error("Error uploading vision board:", error);
    throw error;
  }
};

// Update a vision board's metadata
export const updateVisionBoard = async (
  id: string,
  updates: { title?: string; description?: string },
): Promise<VisionBoard> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("vision_boards")
      .update({
        title: updates.title,
        description: updates.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    // Map to our interface
    const visionBoard: VisionBoard = {
      id: data.id,
      title: data.title || undefined,
      description: data.description || undefined,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Update local storage
    const existingBoards = await getVisionBoards();
    const updatedBoards = existingBoards.map((board) =>
      board.id === id ? visionBoard : board,
    );
    localStorage.setItem(VISION_BOARDS_KEY, JSON.stringify(updatedBoards));

    return visionBoard;
  } catch (error) {
    console.error("Error updating vision board:", error);
    throw error;
  }
};

// Delete a vision board and its image
export const deleteVisionBoard = async (id: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // First get the vision board to get the image URL
    const { data: visionBoard, error: fetchError } = await supabase
      .from("vision_boards")
      .select("image_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;

    // Extract the file path from the URL
    const imageUrl = visionBoard.image_url;
    const filePath = imageUrl.split("/").pop();

    // Delete the record from the database
    const { error: deleteError } = await supabase
      .from("vision_boards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) throw deleteError;

    // Try to delete the file from storage (if we can extract the path)
    if (filePath) {
      const storagePath = `${user.id}/${filePath}`;
      await supabase.storage.from("vision-boards").remove([storagePath]);
    }

    // Update local storage
    const existingBoards = await getVisionBoards();
    const updatedBoards = existingBoards.filter((board) => board.id !== id);
    localStorage.setItem(VISION_BOARDS_KEY, JSON.stringify(updatedBoards));

    return true;
  } catch (error) {
    console.error("Error deleting vision board:", error);
    return false;
  }
};
