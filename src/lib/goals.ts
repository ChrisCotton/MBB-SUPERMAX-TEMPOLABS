import { supabase, getCurrentUser } from "./supabase";
import { Goal, GoalMilestone, TimeFrame } from "./types";
import { Tables } from "./supabase-types";

// Local storage keys for offline fallback
const GOALS_KEY = "mental-bank-goals";
const MILESTONES_KEY = "mental-bank-goal-milestones";

// Helper functions to map between app types and database types
const mapGoalFromDB = (dbGoal: Tables<"goals">): Goal => ({
  id: dbGoal.id,
  title: dbGoal.title,
  description: dbGoal.description || "",
  targetValue: dbGoal.target_value,
  currentValue: dbGoal.current_value,
  progressPercentage: dbGoal.progress_percentage,
  startDate: dbGoal.start_date,
  targetDate: dbGoal.target_date,
  timeFrame: dbGoal.time_frame as TimeFrame,
  categoryId: dbGoal.category_id || undefined,
  isCompleted: dbGoal.is_completed,
  isActive: dbGoal.is_active,
  reward: dbGoal.reward || undefined,
  createdAt: dbGoal.created_at,
  updatedAt: dbGoal.updated_at,
});

const mapMilestoneFromDB = (
  dbMilestone: Tables<"goal_milestones">,
): GoalMilestone => ({
  id: dbMilestone.id,
  goalId: dbMilestone.goal_id,
  title: dbMilestone.title,
  description: dbMilestone.description || "",
  targetValue: dbMilestone.target_value,
  isCompleted: dbMilestone.is_completed,
  completionDate: dbMilestone.completion_date,
  reward: dbMilestone.reward || undefined,
  createdAt: dbMilestone.created_at,
});

// Goal functions
export const getGoals = async (): Promise<Goal[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const goalsJson = localStorage.getItem(GOALS_KEY);
      return goalsJson ? JSON.parse(goalsJson) : [];
    }

    // Fetch goals
    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id);

    if (goalsError) throw goalsError;

    // Fetch milestones for all goals
    const goals = goalsData.map(mapGoalFromDB);
    const goalIds = goals.map((goal) => goal.id);

    if (goalIds.length > 0) {
      const { data: milestonesData, error: milestonesError } = await supabase
        .from("goal_milestones")
        .select("*")
        .in("goal_id", goalIds);

      if (milestonesError) throw milestonesError;

      // Attach milestones to their respective goals
      const milestones = milestonesData.map(mapMilestoneFromDB);
      goals.forEach((goal) => {
        goal.milestones = milestones.filter((m) => m.goalId === goal.id);
      });
    }

    // Save to localStorage as backup
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    return goals;
  } catch (error) {
    console.error("Error fetching goals:", error);
    // Fallback to localStorage on error
    const goalsJson = localStorage.getItem(GOALS_KEY);
    return goalsJson ? JSON.parse(goalsJson) : [];
  }
};

export const addGoal = async (
  goal: Omit<
    Goal,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "progressPercentage"
    | "isCompleted"
    | "milestones"
  >,
): Promise<Goal> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const goals = await getGoals();
      const newGoal: Goal = {
        ...goal,
        id: `goal-${Date.now()}`,
        progressPercentage: Math.min(
          100,
          Math.round((goal.currentValue / goal.targetValue) * 100),
        ),
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        milestones: [],
      };

      goals.push(newGoal);
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
      return newGoal;
    }

    // Calculate progress percentage
    const progressPercentage = Math.min(
      100,
      Math.round((goal.currentValue / goal.targetValue) * 100),
    );

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: goal.title,
        description: goal.description,
        target_value: goal.targetValue,
        current_value: goal.currentValue,
        progress_percentage: progressPercentage,
        start_date: goal.startDate,
        target_date: goal.targetDate,
        time_frame: goal.timeFrame,
        category_id: goal.categoryId,
        is_completed: false,
        is_active: true,
        reward: goal.reward,
      })
      .select()
      .single();

    if (error) throw error;
    return mapGoalFromDB(data);
  } catch (error) {
    console.error("Error adding goal:", error);
    throw error;
  }
};

export const updateGoal = async (
  id: string,
  goalData: Partial<Goal>,
): Promise<Goal | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const goals = await getGoals();
      const index = goals.findIndex((g) => g.id === id);
      if (index === -1) return null;

      // If updating current value, recalculate progress percentage
      let progressPercentage = goals[index].progressPercentage;
      if (goalData.currentValue !== undefined) {
        const targetValue = goalData.targetValue || goals[index].targetValue;
        progressPercentage = Math.min(
          100,
          Math.round((goalData.currentValue / targetValue) * 100),
        );
        goalData.progressPercentage = progressPercentage;
      }

      const updatedGoal = {
        ...goals[index],
        ...goalData,
        updatedAt: new Date().toISOString(),
      };
      goals[index] = updatedGoal;
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
      return updatedGoal;
    }

    // First get the current goal to check if we need to recalculate progress
    const { data: currentGoal, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map fields to database column names
    if (goalData.title !== undefined) updateData.title = goalData.title;
    if (goalData.description !== undefined)
      updateData.description = goalData.description;
    if (goalData.targetValue !== undefined)
      updateData.target_value = goalData.targetValue;
    if (goalData.startDate !== undefined)
      updateData.start_date = goalData.startDate;
    if (goalData.targetDate !== undefined)
      updateData.target_date = goalData.targetDate;
    if (goalData.timeFrame !== undefined)
      updateData.time_frame = goalData.timeFrame;
    if (goalData.categoryId !== undefined)
      updateData.category_id = goalData.categoryId;
    if (goalData.isCompleted !== undefined)
      updateData.is_completed = goalData.isCompleted;
    if (goalData.isActive !== undefined)
      updateData.is_active = goalData.isActive;
    if (goalData.reward !== undefined) updateData.reward = goalData.reward;

    // If updating current value or target value, recalculate progress percentage
    if (
      goalData.currentValue !== undefined ||
      goalData.targetValue !== undefined
    ) {
      const currentValue = goalData.currentValue ?? currentGoal.current_value;
      const targetValue = goalData.targetValue ?? currentGoal.target_value;
      const progressPercentage = Math.min(
        100,
        Math.round((currentValue / targetValue) * 100),
      );

      updateData.current_value = currentValue;
      updateData.progress_percentage = progressPercentage;
    }

    // If explicitly setting progress percentage, use that instead
    if (goalData.progressPercentage !== undefined) {
      updateData.progress_percentage = goalData.progressPercentage;
    }

    const { data, error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    // Get updated milestones
    const { data: milestonesData, error: milestonesError } = await supabase
      .from("goal_milestones")
      .select("*")
      .eq("goal_id", id);

    if (milestonesError) throw milestonesError;

    const updatedGoal = mapGoalFromDB(data);
    updatedGoal.milestones = milestonesData.map(mapMilestoneFromDB);

    return updatedGoal;
  } catch (error) {
    console.error("Error updating goal:", error);
    throw error;
  }
};

export const deleteGoal = async (id: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const goals = await getGoals();
      const filteredGoals = goals.filter((g) => g.id !== id);
      localStorage.setItem(GOALS_KEY, JSON.stringify(filteredGoals));
      return true;
    }

    // Instead of deleting, mark as inactive
    const { error } = await supabase
      .from("goals")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting goal:", error);
    return false;
  }
};

// Goal Milestone functions
export const getGoalMilestones = async (
  goalId: string,
): Promise<GoalMilestone[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const milestonesJson = localStorage.getItem(MILESTONES_KEY);
      const allMilestones = milestonesJson ? JSON.parse(milestonesJson) : [];
      return allMilestones.filter((m: GoalMilestone) => m.goalId === goalId);
    }

    // First verify the goal belongs to the user
    const { data: goalData, error: goalError } = await supabase
      .from("goals")
      .select("id")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .single();

    if (goalError) throw goalError;

    const { data, error } = await supabase
      .from("goal_milestones")
      .select("*")
      .eq("goal_id", goalId);

    if (error) throw error;
    return data.map(mapMilestoneFromDB);
  } catch (error) {
    console.error("Error fetching goal milestones:", error);
    // Fallback to localStorage on error
    const milestonesJson = localStorage.getItem(MILESTONES_KEY);
    const allMilestones = milestonesJson ? JSON.parse(milestonesJson) : [];
    return allMilestones.filter((m: GoalMilestone) => m.goalId === goalId);
  }
};

export const addGoalMilestone = async (
  milestone: Omit<
    GoalMilestone,
    "id" | "isCompleted" | "completionDate" | "createdAt"
  >,
): Promise<GoalMilestone> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const milestonesJson = localStorage.getItem(MILESTONES_KEY);
      const allMilestones = milestonesJson ? JSON.parse(milestonesJson) : [];

      const newMilestone: GoalMilestone = {
        ...milestone,
        id: `milestone-${Date.now()}`,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      allMilestones.push(newMilestone);
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(allMilestones));
      return newMilestone;
    }

    // First verify the goal belongs to the user
    const { data: goalData, error: goalError } = await supabase
      .from("goals")
      .select("id")
      .eq("id", milestone.goalId)
      .eq("user_id", user.id)
      .single();

    if (goalError) throw goalError;

    const { data, error } = await supabase
      .from("goal_milestones")
      .insert({
        goal_id: milestone.goalId,
        title: milestone.title,
        description: milestone.description,
        target_value: milestone.targetValue,
        is_completed: false,
        reward: milestone.reward,
      })
      .select()
      .single();

    if (error) throw error;
    return mapMilestoneFromDB(data);
  } catch (error) {
    console.error("Error adding goal milestone:", error);
    throw error;
  }
};

export const updateGoalMilestone = async (
  id: string,
  milestoneData: Partial<GoalMilestone>,
): Promise<GoalMilestone | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const milestonesJson = localStorage.getItem(MILESTONES_KEY);
      const allMilestones = milestonesJson ? JSON.parse(milestonesJson) : [];

      const index = allMilestones.findIndex((m: GoalMilestone) => m.id === id);
      if (index === -1) return null;

      const updatedMilestone = { ...allMilestones[index], ...milestoneData };
      allMilestones[index] = updatedMilestone;
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(allMilestones));
      return updatedMilestone;
    }

    // First get the milestone to verify it belongs to a goal owned by the user
    const { data: currentMilestone, error: fetchError } = await supabase
      .from("goal_milestones")
      .select("*, goals!inner(user_id)")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Verify the goal belongs to the user
    if (currentMilestone.goals.user_id !== user.id) {
      throw new Error("Unauthorized access to milestone");
    }

    const updateData: any = {};

    // Map fields to database column names
    if (milestoneData.title !== undefined)
      updateData.title = milestoneData.title;
    if (milestoneData.description !== undefined)
      updateData.description = milestoneData.description;
    if (milestoneData.targetValue !== undefined)
      updateData.target_value = milestoneData.targetValue;
    if (milestoneData.isCompleted !== undefined) {
      updateData.is_completed = milestoneData.isCompleted;
      if (milestoneData.isCompleted) {
        updateData.completion_date =
          milestoneData.completionDate || new Date().toISOString();
      } else {
        updateData.completion_date = null;
      }
    }
    if (milestoneData.completionDate !== undefined)
      updateData.completion_date = milestoneData.completionDate;
    if (milestoneData.reward !== undefined)
      updateData.reward = milestoneData.reward;

    const { data, error } = await supabase
      .from("goal_milestones")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapMilestoneFromDB(data);
  } catch (error) {
    console.error("Error updating goal milestone:", error);
    throw error;
  }
};

export const deleteGoalMilestone = async (id: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const milestonesJson = localStorage.getItem(MILESTONES_KEY);
      const allMilestones = milestonesJson ? JSON.parse(milestonesJson) : [];

      const filteredMilestones = allMilestones.filter(
        (m: GoalMilestone) => m.id !== id,
      );
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(filteredMilestones));
      return true;
    }

    // First get the milestone to verify it belongs to a goal owned by the user
    const { data: currentMilestone, error: fetchError } = await supabase
      .from("goal_milestones")
      .select("*, goals!inner(user_id)")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Verify the goal belongs to the user
    if (currentMilestone.goals.user_id !== user.id) {
      throw new Error("Unauthorized access to milestone");
    }

    const { error } = await supabase
      .from("goal_milestones")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting goal milestone:", error);
    return false;
  }
};
