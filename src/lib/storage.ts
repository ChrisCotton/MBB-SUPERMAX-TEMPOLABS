import { Category, Task, MentalBankBalance } from "./types";
import { supabase, getCurrentUser } from "./supabase";
import { Tables } from "./supabase-types";

// Fallback to localStorage if offline or for unauthenticated users
const CATEGORIES_KEY = "mental-bank-categories";
const TASKS_KEY = "mental-bank-tasks";
const BALANCE_KEY = "mental-bank-balance";

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
  completed: dbTask.completed,
  createdAt: dbTask.created_at,
  completedAt: dbTask.completed_at,
  actualTimeSpent: dbTask.actual_time_spent,
  inProgress: dbTask.in_progress,
  currentSessionStartTime: dbTask.current_session_start_time,
  priority: dbTask.priority || "medium",
  status: dbTask.status,
  comments: dbTask.comments || "",
});

const mapBalanceFromDB = (
  dbBalance: Tables<"mental_bank_balances">,
): MentalBankBalance => ({
  currentBalance: dbBalance.current_balance,
  targetBalance: dbBalance.target_balance,
  progressPercentage: dbBalance.progress_percentage,
  dailyGrowth: dbBalance.daily_growth,
});

// Category functions
export const getCategories = async (): Promise<Category[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const categoriesJson = localStorage.getItem(CATEGORIES_KEY);
      return categoriesJson ? JSON.parse(categoriesJson) : [];
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    return (data || []).map(mapCategoryFromDB);
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Fallback to localStorage on error
    const categoriesJson = localStorage.getItem(CATEGORIES_KEY);
    return categoriesJson ? JSON.parse(categoriesJson) : [];
  }
};

export const saveCategories = async (categories: Category[]): Promise<void> => {
  // Always save to localStorage as backup
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const addCategory = async (
  category: Omit<Category, "id">,
): Promise<Category> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const categories = await getCategories();
      const newCategory = {
        ...category,
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tasksCount: 0,
      };

      categories.push(newCategory);
      await saveCategories(categories);
      return newCategory;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: category.name,
        hourly_rate: category.hourlyRate,
        tasks_count: 0,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return mapCategoryFromDB(data);
  } catch (error) {
    console.error("Error adding category:", error);
    // Fallback to localStorage on error
    const categories = await getCategories();
    const newCategory = {
      ...category,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tasksCount: 0,
    };

    categories.push(newCategory);
    await saveCategories(categories);
    return newCategory;
  }
};

export const updateCategory = async (
  id: string,
  categoryData: Partial<Omit<Category, "id">>,
): Promise<Category | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const categories = await getCategories();
      const index = categories.findIndex((cat) => cat.id === id);

      if (index === -1) return null;

      const updatedCategory = { ...categories[index], ...categoryData };
      categories[index] = updatedCategory;
      await saveCategories(categories);
      return updatedCategory;
    }

    const updateData: any = {};
    if (categoryData.name !== undefined) updateData.name = categoryData.name;
    if (categoryData.hourlyRate !== undefined)
      updateData.hourly_rate = categoryData.hourlyRate;
    if (categoryData.tasksCount !== undefined)
      updateData.tasks_count = categoryData.tasksCount;

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return mapCategoryFromDB(data);
  } catch (error) {
    console.error("Error updating category:", error);
    // Fallback to localStorage on error
    const categories = await getCategories();
    const index = categories.findIndex((cat) => cat.id === id);

    if (index === -1) return null;

    const updatedCategory = { ...categories[index], ...categoryData };
    categories[index] = updatedCategory;
    await saveCategories(categories);
    return updatedCategory;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const categories = await getCategories();
      const filteredCategories = categories.filter((cat) => cat.id !== id);

      if (filteredCategories.length === categories.length) return false;

      await saveCategories(filteredCategories);
      return true;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    // Fallback to localStorage on error
    const categories = await getCategories();
    const filteredCategories = categories.filter((cat) => cat.id !== id);

    if (filteredCategories.length === categories.length) return false;

    await saveCategories(filteredCategories);
    return true;
  }
};

// Task functions
export const getTasks = async (): Promise<Task[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const tasksJson = localStorage.getItem(TASKS_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    return (data || []).map(mapTaskFromDB);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    // Fallback to localStorage on error
    const tasksJson = localStorage.getItem(TASKS_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  // Always save to localStorage as backup
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const addTask = async (
  task: Omit<Task, "id" | "createdAt" | "completedAt">,
): Promise<Task> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const tasks = await getTasks();

      // Check for duplicates before adding
      const isDuplicate = tasks.some(
        (existingTask) =>
          existingTask.title === task.title &&
          existingTask.description === task.description &&
          existingTask.category === task.category &&
          existingTask.hourlyRate === task.hourlyRate &&
          existingTask.estimatedHours === task.estimatedHours,
      );

      if (isDuplicate) {
        console.warn("Duplicate task detected in storage. Task not added.");
        // Return the existing task that matches
        return tasks.find(
          (existingTask) =>
            existingTask.title === task.title &&
            existingTask.description === task.description,
        ) as Task;
      }

      const newTask = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        priority: task.priority || "medium",
      };

      tasks.push(newTask);
      await saveTasks(tasks);

      // Update category task count
      await updateCategoryTaskCount(task.category);

      return newTask;
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
        status: task.status,
        user_id: user.id,
        comments: task.comments,
      })
      .select()
      .single();

    if (error) throw error;

    // Update category task count
    await updateCategoryTaskCount(task.category);

    return mapTaskFromDB(data);
  } catch (error) {
    console.error("Error adding task:", error);
    // Fallback to localStorage on error
    const tasks = await getTasks();
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    await saveTasks(tasks);

    // Update category task count
    await updateCategoryTaskCount(task.category);

    return newTask;
  }
};

export const updateTask = async (
  id: string,
  taskData: Partial<Task>,
): Promise<Task | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const tasks = await getTasks();
      const index = tasks.findIndex((task) => task.id === id);

      if (index === -1) return null;

      const updatedTask = { ...tasks[index], ...taskData };
      tasks[index] = updatedTask;
      await saveTasks(tasks);

      // If category changed, update task counts
      if (taskData.category && taskData.category !== tasks[index].category) {
        await updateCategoryTaskCount(tasks[index].category, -1);
        await updateCategoryTaskCount(taskData.category);
      }

      return updatedTask;
    }

    // First get the current task to check if category changed
    const { data: currentTask, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;

    const updateData: any = {};
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined)
      updateData.description = taskData.description;
    if (taskData.category !== undefined)
      updateData.category_id = taskData.category;
    if (taskData.hourlyRate !== undefined)
      updateData.hourly_rate = taskData.hourlyRate;
    if (taskData.estimatedHours !== undefined)
      updateData.estimated_hours = taskData.estimatedHours;
    if (taskData.completed !== undefined)
      updateData.completed = taskData.completed;
    if (taskData.priority !== undefined)
      updateData.priority = taskData.priority;
    if (taskData.comments !== undefined)
      updateData.comments = taskData.comments;

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    // If category changed, update task counts
    if (taskData.category && taskData.category !== currentTask.category_id) {
      await updateCategoryTaskCount(currentTask.category_id, -1);
      await updateCategoryTaskCount(taskData.category);
    }

    return mapTaskFromDB(data);
  } catch (error) {
    console.error("Error updating task:", error);
    // Fallback to localStorage on error
    const tasks = await getTasks();
    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) return null;

    const updatedTask = { ...tasks[index], ...taskData };
    tasks[index] = updatedTask;
    await saveTasks(tasks);

    // If category changed, update task counts
    if (taskData.category && taskData.category !== tasks[index].category) {
      await updateCategoryTaskCount(tasks[index].category, -1);
      await updateCategoryTaskCount(taskData.category);
    }

    return updatedTask;
  }
};

export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const tasks = await getTasks();
      const taskToDelete = tasks.find((task) => task.id === id);
      if (!taskToDelete) return false;

      const filteredTasks = tasks.filter((task) => task.id !== id);
      await saveTasks(filteredTasks);

      // Update category task count
      await updateCategoryTaskCount(taskToDelete.category, -1);

      return true;
    }

    // First get the task to get its category
    const { data: task, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    // Update category task count
    await updateCategoryTaskCount(task.category_id, -1);

    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    // Fallback to localStorage on error
    const tasks = await getTasks();
    const taskToDelete = tasks.find((task) => task.id === id);
    if (!taskToDelete) return false;

    const filteredTasks = tasks.filter((task) => task.id !== id);
    await saveTasks(filteredTasks);

    // Update category task count
    await updateCategoryTaskCount(taskToDelete.category, -1);

    return true;
  }
};

// Mental Bank Balance functions
export const getMentalBankBalance = async (): Promise<MentalBankBalance> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const balanceJson = localStorage.getItem(BALANCE_KEY);
      return balanceJson
        ? JSON.parse(balanceJson)
        : {
            currentBalance: 5250.0,
            targetBalance: 15750.0,
            progressPercentage: 33,
            dailyGrowth: 4.2,
          };
    }

    const { data, error } = await supabase
      .from("mental_bank_balances")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // If no balance exists yet, create a default one
      if (error.code === "PGRST116") {
        return createDefaultMentalBankBalance();
      }
      throw error;
    }

    return mapBalanceFromDB(data);
  } catch (error) {
    console.error("Error fetching mental bank balance:", error);
    // Fallback to localStorage on error
    const balanceJson = localStorage.getItem(BALANCE_KEY);
    return balanceJson
      ? JSON.parse(balanceJson)
      : {
          currentBalance: 5250.0,
          targetBalance: 15750.0,
          progressPercentage: 33,
          dailyGrowth: 4.2,
        };
  }
};

export const saveMentalBankBalance = async (
  balance: MentalBankBalance,
): Promise<void> => {
  // Always save to localStorage as backup
  localStorage.setItem(BALANCE_KEY, JSON.stringify(balance));
};

export const updateMentalBankBalance = async (
  balance: Partial<MentalBankBalance>,
): Promise<MentalBankBalance> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const currentBalance = await getMentalBankBalance();
      const updatedBalance = { ...currentBalance, ...balance };
      await saveMentalBankBalance(updatedBalance);
      return updatedBalance;
    }

    // First check if a balance exists
    const { data: existingBalance, error: fetchError } = await supabase
      .from("mental_bank_balances")
      .select("id")
      .eq("user_id", user.id);

    // If no balance exists, create one
    if (fetchError || !existingBalance || existingBalance.length === 0) {
      return createMentalBankBalance(balance);
    }

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
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    const updatedBalance = mapBalanceFromDB(data);
    await saveMentalBankBalance(updatedBalance);
    return updatedBalance;
  } catch (error) {
    console.error("Error updating mental bank balance:", error);
    // Fallback to localStorage on error
    const currentBalance = await getMentalBankBalance();
    const updatedBalance = { ...currentBalance, ...balance };
    await saveMentalBankBalance(updatedBalance);
    return updatedBalance;
  }
};

const createMentalBankBalance = async (
  balance?: Partial<MentalBankBalance>,
): Promise<MentalBankBalance> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const defaultBalance = {
        currentBalance: balance?.currentBalance ?? 5250.0,
        targetBalance: balance?.targetBalance ?? 15750.0,
        progressPercentage: balance?.progressPercentage ?? 33,
        dailyGrowth: balance?.dailyGrowth ?? 4.2,
      };
      await saveMentalBankBalance(defaultBalance);
      return defaultBalance;
    }

    const defaultBalance = {
      current_balance: balance?.currentBalance ?? 5250.0,
      target_balance: balance?.targetBalance ?? 15750.0,
      progress_percentage: balance?.progressPercentage ?? 33,
      daily_growth: balance?.dailyGrowth ?? 4.2,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("mental_bank_balances")
      .insert(defaultBalance)
      .select()
      .single();

    if (error) throw error;

    const newBalance = mapBalanceFromDB(data);
    await saveMentalBankBalance(newBalance);
    return newBalance;
  } catch (error) {
    console.error("Error creating mental bank balance:", error);
    // Fallback to localStorage on error
    const defaultBalance = {
      currentBalance: balance?.currentBalance ?? 5250.0,
      targetBalance: balance?.targetBalance ?? 15750.0,
      progressPercentage: balance?.progressPercentage ?? 33,
      dailyGrowth: balance?.dailyGrowth ?? 4.2,
    };
    await saveMentalBankBalance(defaultBalance);
    return defaultBalance;
  }
};

const createDefaultMentalBankBalance = async (): Promise<MentalBankBalance> => {
  return createMentalBankBalance();
};

// Helper function to update category task counts
const updateCategoryTaskCount = async (
  categoryId: string,
  change: number = 1,
): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const categories = await getCategories();
      const index = categories.findIndex((cat) => cat.id === categoryId);

      if (index !== -1) {
        const currentCount = categories[index].tasksCount || 0;
        categories[index].tasksCount = Math.max(0, currentCount + change);
        await saveCategories(categories);
      }
      return;
    }

    // Get current count
    const { data: category, error: fetchError } = await supabase
      .from("categories")
      .select("tasks_count")
      .eq("id", categoryId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;

    const currentCount = category.tasks_count || 0;
    const newCount = Math.max(0, currentCount + change);

    const { error } = await supabase
      .from("categories")
      .update({ tasks_count: newCount })
      .eq("id", categoryId)
      .eq("user_id", user.id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating category task count:", error);
    // Fallback to localStorage on error
    const categories = await getCategories();
    const index = categories.findIndex((cat) => cat.id === categoryId);

    if (index !== -1) {
      const currentCount = categories[index].tasksCount || 0;
      categories[index].tasksCount = Math.max(0, currentCount + change);
      await saveCategories(categories);
    }
  }
};
