import { supabase, getCurrentUser } from "./supabase";
import { Task, TimeEntry } from "./types";

// Timer service to manage task timing functionality
export const timerService = {
  // Start timing a task
  startTimer: async (taskId: string): Promise<boolean> => {
    try {
      const user = await getCurrentUser();
      if (!user) return false;

      const now = new Date().toISOString();

      // Create a new time entry
      const { data: timeEntry, error: timeEntryError } = await supabase
        .from("time_entries")
        .insert({
          task_id: taskId,
          user_id: user.id,
          start_time: now,
          is_running: true,
        })
        .select()
        .single();

      if (timeEntryError) throw timeEntryError;

      // Update the task to mark it as in progress
      const { error: taskError } = await supabase
        .from("tasks")
        .update({
          in_progress: true,
          current_session_start_time: now,
        })
        .eq("id", taskId)
        .eq("user_id", user.id);

      if (taskError) throw taskError;

      return true;
    } catch (error) {
      console.error("Error starting timer:", error);
      return false;
    }
  },

  // Pause the current timing session
  pauseTimer: async (taskId: string): Promise<boolean> => {
    try {
      const user = await getCurrentUser();
      if (!user) return false;

      // Find the active time entry for this task
      const { data: timeEntries, error: fetchError } = await supabase
        .from("time_entries")
        .select("*")
        .eq("task_id", taskId)
        .eq("user_id", user.id)
        .eq("is_running", true)
        .order("start_time", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;
      if (!timeEntries || timeEntries.length === 0) return false;

      const timeEntry = timeEntries[0];
      const now = new Date().toISOString();

      // Calculate duration in seconds
      const startTime = new Date(timeEntry.start_time).getTime();
      const endTime = new Date(now).getTime();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);

      // Update the time entry
      const { error: updateError } = await supabase
        .from("time_entries")
        .update({
          end_time: now,
          duration: durationSeconds,
          // No is_running field, end_time not null indicates stopped
        })
        .eq("id", timeEntry.id);

      if (updateError) throw updateError;

      // Update the task
      const { error: taskError } = await supabase
        .from("tasks")
        .update({
          in_progress: false,
          current_session_start_time: null,
        })
        .eq("id", taskId)
        .eq("user_id", user.id);

      if (taskError) throw taskError;

      return true;
    } catch (error) {
      console.error("Error pausing timer:", error);
      return false;
    }
  },

  // Stop timing and save the total time
  stopTimer: async (taskId: string): Promise<boolean> => {
    try {
      // First pause the timer to save the current session
      const paused = await timerService.pauseTimer(taskId);
      if (!paused) return false;

      return true;
    } catch (error) {
      console.error("Error stopping timer:", error);
      return false;
    }
  },

  // Save the logged time to the task
  saveTimeToTask: async (
    taskId: string,
    timeSpentHours: number,
  ): Promise<boolean> => {
    try {
      const user = await getCurrentUser();
      if (!user) return false;

      // Update the task with the actual time spent
      const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("actual_time_spent")
        .eq("id", taskId)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentTimeSpent = task.actual_time_spent || 0;
      const newTimeSpent = currentTimeSpent + timeSpentHours;

      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          actual_time_spent: newTimeSpent,
        })
        .eq("id", taskId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error("Error saving time to task:", error);
      return false;
    }
  },

  // Get the current timer state for a task
  getTimerState: async (
    taskId: string,
  ): Promise<{ isRunning: boolean; elapsedTime: number }> => {
    try {
      const user = await getCurrentUser();
      if (!user) return { isRunning: false, elapsedTime: 0 };

      // Get the task to check if it's in progress
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("in_progress, current_session_start_time")
        .eq("id", taskId)
        .eq("user_id", user.id)
        .single();

      if (taskError) throw taskError;

      let elapsedTime = 0;

      // Get all completed time entries for this task
      const { data: completedEntries, error: entriesError } = await supabase
        .from("time_entries")
        .select("duration")
        .eq("task_id", taskId)
        .eq("user_id", user.id)
        .not("end_time", "is", null);

      if (entriesError) throw entriesError;

      // Sum up all completed durations
      if (completedEntries && completedEntries.length > 0) {
        elapsedTime = completedEntries.reduce(
          (total, entry) => total + (entry.duration || 0),
          0,
        );
      }

      // If the task is currently being timed, add the current session time
      if (task.in_progress && task.current_session_start_time) {
        const startTime = new Date(task.current_session_start_time).getTime();
        const now = Date.now();
        const currentSessionSeconds = Math.floor((now - startTime) / 1000);
        elapsedTime += currentSessionSeconds;
      }

      return {
        isRunning: task.in_progress || false,
        elapsedTime,
      };
    } catch (error) {
      console.error("Error getting timer state:", error);
      return { isRunning: false, elapsedTime: 0 };
    }
  },

  // Get all time entries for a task
  getTimeEntries: async (taskId: string): Promise<TimeEntry[]> => {
    try {
      const user = await getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("task_id", taskId)
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });

      if (error) throw error;

      return (data || []).map((entry) => ({
        id: entry.id,
        startTime: entry.start_time,
        endTime: entry.end_time,
        duration: entry.duration || 0,
        // No is_running field needed
      }));
    } catch (error) {
      console.error("Error getting time entries:", error);
      return [];
    }
  },
};
