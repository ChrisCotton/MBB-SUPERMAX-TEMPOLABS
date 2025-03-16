import { supabase } from "./supabase";
import { Task, MentalBankBalance, Category } from "./types";
import { Tables } from "./supabase-types";

// Helper functions to map between app types and database types
const mapCategoryFromDB = (dbCategory: Tables<"categories">): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  hourlyRate: dbCategory.hourly_rate,
  tasksCount: dbCategory.tasks_count || 0,
});

const mapTaskFromDB = (dbTask: Tables<"tasks">): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || "",
  category: dbTask.category_id,
  hourlyRate: dbTask.hourly_rate,
  estimatedHours: dbTask.estimated_hours,
  completed: dbTask.completed || false,
  createdAt: dbTask.created_at || new Date().toISOString(),
  priority: (dbTask.priority as "low" | "medium" | "high") || "medium",
  dueDate: dbTask.due_date,
  completedAt: dbTask.completed_at,
});

const mapBalanceFromDB = (
  dbBalance: Tables<"mental_bank_balances">,
): MentalBankBalance => ({
  currentBalance: dbBalance.current_balance,
  targetBalance: dbBalance.target_balance,
  progressPercentage: dbBalance.progress_percentage,
  dailyGrowth: dbBalance.daily_growth,
});

// Fetch Mental Bank Balance
export const fetchMentalBankBalance = async (): Promise<MentalBankBalance> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("mental_bank_balances")
      .select("*")
      .eq("user_id", user.user.id)
      .single();

    if (error) {
      // If no balance exists yet, return default values
      if (error.code === "PGRST116") {
        return {
          currentBalance: 5250.0,
          targetBalance: 15750.0,
          progressPercentage: 33,
          dailyGrowth: 4.2,
        };
      }
      throw error;
    }

    return mapBalanceFromDB(data);
  } catch (error) {
    console.error("Error fetching mental bank balance:", error);
    // Return default values on error
    return {
      currentBalance: 5250.0,
      targetBalance: 15750.0,
      progressPercentage: 33,
      dailyGrowth: 4.2,
    };
  }
};

// Update Mental Bank Balance
export const updateMentalBankBalance = async (
  balance: Partial<MentalBankBalance>,
): Promise<MentalBankBalance> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    // First check if a balance exists
    const { data: existingBalance, error: fetchError } = await supabase
      .from("mental_bank_balances")
      .select("*")
      .eq("user_id", user.user.id)
      .single();

    // If no balance exists, create one
    if (fetchError && fetchError.code === "PGRST116") {
      return createMentalBankBalance(balance);
    }

    if (fetchError) throw fetchError;

    // Get current values to merge with updates
    const currentBalance = mapBalanceFromDB(existingBalance);
    const updatedBalance = { ...currentBalance, ...balance };

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (balance.currentBalance !== undefined)
      updateData.current_balance = balance.currentBalance;
    if (balance.targetBalance !== undefined)
      updateData.target_balance = balance.targetBalance;
    if (balance.progressPercentage !== undefined)
      updateData.progress_percentage = balance.progressPercentage;
    if (balance.dailyGrowth !== undefined)
      updateData.daily_growth = balance.dailyGrowth;

    const { data, error } = await supabase
      .from("mental_bank_balances")
      .update(updateData)
      .eq("user_id", user.user.id)
      .select()
      .single();

    if (error) throw error;

    return mapBalanceFromDB(data);
  } catch (error) {
    console.error("Error updating mental bank balance:", error);
    // Return the balance that was attempted to be set
    return {
      currentBalance: balance.currentBalance || 5250.0,
      targetBalance: balance.targetBalance || 15750.0,
      progressPercentage: balance.progressPercentage || 33,
      dailyGrowth: balance.dailyGrowth || 4.2,
    };
  }
};

// Create a new Mental Bank Balance
const createMentalBankBalance = async (
  balance?: Partial<MentalBankBalance>,
): Promise<MentalBankBalance> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const defaultBalance = {
      current_balance: balance?.currentBalance ?? 5250.0,
      target_balance: balance?.targetBalance ?? 15750.0,
      progress_percentage: balance?.progressPercentage ?? 33,
      daily_growth: balance?.dailyGrowth ?? 4.2,
      user_id: user.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("mental_bank_balances")
      .insert(defaultBalance)
      .select()
      .single();

    if (error) throw error;

    return mapBalanceFromDB(data);
  } catch (error) {
    console.error("Error creating mental bank balance:", error);
    // Return default values on error
    return {
      currentBalance: balance?.currentBalance ?? 5250.0,
      targetBalance: balance?.targetBalance ?? 15750.0,
      progressPercentage: balance?.progressPercentage ?? 33,
      dailyGrowth: balance?.dailyGrowth ?? 4.2,
    };
  }
};

// Fetch tasks from the database
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.user.id);

    if (error) throw error;
    return (data || []).map(mapTaskFromDB);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

// Fetch categories from the database
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.user.id);

    if (error) throw error;
    return (data || []).map(mapCategoryFromDB);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Create a new task
export const createTask = async (
  task: Omit<Task, "id" | "createdAt" | "completedAt">,
): Promise<Task> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        description: task.description,
        category_id: task.category,
        hourly_rate: task.hourlyRate,
        estimated_hours: task.estimatedHours,
        completed: task.completed,
        priority: task.priority || "medium",
        due_date: task.dueDate,
        user_id: user.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return mapTaskFromDB(data);
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};
