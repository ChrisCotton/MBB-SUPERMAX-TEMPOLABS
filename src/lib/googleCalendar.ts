// Google Calendar API integration for Mental Bank Task Manager
import { Task } from "./types";
import { supabase, getCurrentUser } from "./supabase";

// Configuration for Google Calendar API
const GOOGLE_API_KEY = "AIzaSyBNho8MeBJd0n9Ku2-TrPLpoGstJIQcvwE";
const GOOGLE_CLIENT_ID =
  "1098123792773-2vt9kg5h26d7jjpkkb6v1de2fvbv6e7t.apps.googleusercontent.com";

// Add authorized domains for OAuth
const AUTHORIZED_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "silly-kalam5-hrwgv.view-2.tempo-dev.app",
  "tempo-dev.app",
];
const SCOPES = "https://www.googleapis.com/auth/calendar";

// Interface for Google Calendar settings
export interface GoogleCalendarSettings {
  isConnected: boolean;
  selectedCalendarId: string;
  autoSyncNewTasks: boolean;
  syncCompletedTasks: boolean;
  syncHighPriorityOnly: boolean;
  refreshToken?: string;
  accessToken?: string;
  tokenExpiry?: string;
}

// Check if Google API is properly configured
export const isGoogleCalendarConfigured = (): boolean => {
  return Boolean(GOOGLE_API_KEY && GOOGLE_CLIENT_ID);
};

// Check if user is connected to Google Calendar
export const checkGoogleCalendarConnection = async (): Promise<boolean> => {
  try {
    if (!isGoogleCalendarConfigured()) return false;

    // First check if we have a connection in the database
    const user = await getCurrentUser();
    if (user) {
      try {
        const { data } = await supabase
          .from("google_calendar_settings")
          .select("is_connected")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data && data.is_connected) {
          return true;
        }
      } catch (err) {
        console.error("Error checking database connection:", err);
      }
    }

    // In demo mode, we don't actually check client-side Google auth
    // to avoid the domain registration errors
    return false;

    /* Original implementation - disabled for demo mode
    // If no database record or not connected, check client-side
    try {
      // Load the API if not already loaded
      if (!window.gapi) {
        await loadGoogleCalendarAPI();
      } else if (!window.gapi.auth2) {
        await new Promise<void>((resolve, reject) => {
          window.gapi.load("auth2", {
            callback: () => {
              window.gapi.auth2
                .init({
                  client_id: GOOGLE_CLIENT_ID,
                  scope: SCOPES,
                })
                .then(() => resolve())
                .catch(reject);
            },
            onerror: reject,
          });
        });
      }

      return isSignedInToGoogle();
    } catch (err) {
      console.error("Error initializing Google auth:", err);
      return false;
    }
    */
  } catch (error) {
    console.error("Error checking Google Calendar connection:", error);
    return false;
  }
};

// Load the Google API client library
export const loadGoogleCalendarAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if the API is already loaded
    if (window.gapi && window.gapi.client) {
      resolve();
      return;
    }

    // Create script element to load Google API
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load("client:auth2", () => {
        try {
          window.gapi.client
            .init({
              apiKey: GOOGLE_API_KEY,
              clientId: GOOGLE_CLIENT_ID,
              scope: SCOPES,
              // Removed discoveryDocs which was causing the 400 error
            })
            .then(() => {
              // Load calendar API separately after client init
              return window.gapi.client.load("calendar", "v3");
            })
            .then(() => {
              resolve();
            })
            .catch((error: any) => {
              console.error("Error initializing Google API client:", error);
              reject(error);
            });
        } catch (error) {
          console.error("Error in gapi initialization:", error);
          reject(error);
        }
      });
    };
    script.onerror = (error) => {
      console.error("Error loading Google API script:", error);
      reject(error);
    };

    document.body.appendChild(script);
  });
};

// Check if user is signed in to Google
export const isSignedInToGoogle = (): boolean => {
  try {
    if (!window.gapi || !window.gapi.auth2) return false;
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (!authInstance) return false;
    return authInstance.isSignedIn.get();
  } catch (error) {
    console.error("Error checking if user is signed in to Google:", error);
    return false;
  }
};

// Sign in to Google
export const signInToGoogle = async (): Promise<void> => {
  if (!window.gapi || !window.gapi.auth2) {
    await loadGoogleCalendarAPI();
  }

  try {
    // Check if current domain is authorized
    const currentDomain = window.location.hostname;
    if (!AUTHORIZED_DOMAINS.some((domain) => currentDomain.includes(domain))) {
      throw new Error(
        `Not a valid origin for the client: ${window.location.origin}. Please register this origin for your project's client ID.`,
      );
    }

    const googleUser = await window.gapi.auth2.getAuthInstance().signIn({
      prompt: "consent",
      scope: SCOPES,
    });

    // Get auth response
    const authResponse = googleUser.getAuthResponse(true);

    // Save connection info to database
    const user = await getCurrentUser();
    if (user) {
      await saveGoogleCalendarConnection({
        isConnected: true,
        selectedCalendarId: "primary",
        autoSyncNewTasks: false,
        syncCompletedTasks: false,
        syncHighPriorityOnly: false,
        refreshToken: authResponse.refresh_token,
        accessToken: authResponse.access_token,
        tokenExpiry: new Date(authResponse.expires_at).toISOString(),
      });
    }

    return;
  } catch (error) {
    console.error("Error signing in to Google:", error);
    throw error;
  }
};

// Sign out from Google
export const signOutFromGoogle = async (): Promise<void> => {
  if (!window.gapi || !window.gapi.auth2) return;

  try {
    await window.gapi.auth2.getAuthInstance().signOut();

    // Update database connection status
    const user = await getCurrentUser();
    if (user) {
      await supabase
        .from("google_calendar_settings")
        .update({ is_connected: false })
        .eq("user_id", user.id);
    }

    return;
  } catch (error) {
    console.error("Error signing out from Google:", error);
    throw error;
  }
};

// Get user's Google calendars
export const getCalendars = async (): Promise<any[]> => {
  if (!isSignedInToGoogle()) {
    throw new Error("User not signed in to Google");
  }

  const response = await window.gapi.client.calendar.calendarList.list();
  return response.result.items || [];
};

// Save Google Calendar connection settings
export const saveGoogleCalendarConnection = async (
  settings: GoogleCalendarSettings,
): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from("google_calendar_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingSettings) {
      // Update existing settings
      await supabase
        .from("google_calendar_settings")
        .update({
          is_connected: settings.isConnected,
          selected_calendar_id: settings.selectedCalendarId,
          auto_sync_new_tasks: settings.autoSyncNewTasks,
          sync_completed_tasks: settings.syncCompletedTasks,
          sync_high_priority_only: settings.syncHighPriorityOnly,
          refresh_token: settings.refreshToken,
          access_token: settings.accessToken,
          token_expiry: settings.tokenExpiry,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } else {
      // Create new settings
      await supabase.from("google_calendar_settings").insert({
        user_id: user.id,
        is_connected: settings.isConnected,
        selected_calendar_id: settings.selectedCalendarId,
        auto_sync_new_tasks: settings.autoSyncNewTasks,
        sync_completed_tasks: settings.syncCompletedTasks,
        sync_high_priority_only: settings.syncHighPriorityOnly,
        refresh_token: settings.refreshToken,
        access_token: settings.accessToken,
        token_expiry: settings.tokenExpiry,
      });
    }
  } catch (error) {
    console.error("Error saving Google Calendar connection:", error);
    throw error;
  }
};

// Get Google Calendar settings
export const getGoogleCalendarSettings =
  async (): Promise<GoogleCalendarSettings | null> => {
    try {
      const user = await getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("google_calendar_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) return null;

      return {
        isConnected: data.is_connected,
        selectedCalendarId: data.selected_calendar_id || "primary",
        autoSyncNewTasks: data.auto_sync_new_tasks,
        syncCompletedTasks: data.sync_completed_tasks,
        syncHighPriorityOnly: data.sync_high_priority_only,
        refreshToken: data.refresh_token,
        accessToken: data.access_token,
        tokenExpiry: data.token_expiry,
      };
    } catch (error) {
      console.error("Error getting Google Calendar settings:", error);
      return null;
    }
  };

// Add a task to Google Calendar
export const addTaskToCalendar = async (
  task: Task,
  calendarId = "primary",
  scheduledDate?: Date,
): Promise<{ success: boolean; eventId?: string; error?: string }> => {
  try {
    if (!isSignedInToGoogle()) {
      return {
        success: false,
        error:
          "User not signed in to Google. Please connect your Google account in settings.",
      };
    }

    // Calculate event duration based on estimated hours
    const startTime = scheduledDate || new Date();
    const endTime = new Date(
      startTime.getTime() + task.estimatedHours * 60 * 60 * 1000,
    );

    // Format dates for Google Calendar API
    const startDateTime = startTime.toISOString();
    const endDateTime = endTime.toISOString();

    // Create event object
    const event = {
      summary: `[Mental Bank] ${task.title}`,
      description: `${task.description}\n\nEstimated Hours: ${task.estimatedHours}\nHourly Rate: ${task.hourlyRate}\nValue: ${(task.hourlyRate * task.estimatedHours).toFixed(2)}\n\nAdded from Mental Bank Task Manager`,
      start: {
        dateTime: startDateTime,
      },
      end: {
        dateTime: endDateTime,
      },
      reminders: {
        useDefault: true,
      },
      colorId: getPriorityColorId(task.priority),
    };

    const response = await window.gapi.client.calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });

    // Store the event mapping in the database
    const user = await getCurrentUser();
    if (user) {
      await supabase.from("task_calendar_events").insert({
        task_id: task.id,
        calendar_id: calendarId,
        event_id: response.result.id,
      });
    }

    return { success: true, eventId: response.result.id };
  } catch (error: any) {
    console.error("Error adding task to Google Calendar:", error);
    return {
      success: false,
      error:
        error.message ||
        "Failed to add task to Google Calendar. Please try again later.",
    };
  }
};

// Get color ID based on task priority
const getPriorityColorId = (priority: "low" | "medium" | "high"): string => {
  // Google Calendar color IDs: https://developers.google.com/calendar/api/v3/reference/colors/get
  switch (priority) {
    case "high":
      return "4"; // Red
    case "medium":
      return "5"; // Yellow
    case "low":
      return "9"; // Blue
    default:
      return "1"; // Default blue
  }
};

// Update a task in Google Calendar
export const updateTaskInCalendar = async (
  task: Task,
  eventId: string,
  calendarId = "primary",
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isSignedInToGoogle()) {
      return { success: false, error: "User not signed in to Google" };
    }

    // First get the existing event
    const getResponse = await window.gapi.client.calendar.events.get({
      calendarId: calendarId,
      eventId: eventId,
    });

    const existingEvent = getResponse.result;

    // Update the event properties
    existingEvent.summary = `[Mental Bank] ${task.title}`;
    existingEvent.description = `${task.description}\n\nEstimated Hours: ${task.estimatedHours}\nHourly Rate: ${task.hourlyRate}\nValue: ${(task.hourlyRate * task.estimatedHours).toFixed(2)}\n\nUpdated from Mental Bank Task Manager`;
    existingEvent.colorId = getPriorityColorId(task.priority);

    // If task is completed, mark it as such in the description
    if (task.completed) {
      existingEvent.description = `✅ COMPLETED ✅\n\n${existingEvent.description}`;
    }

    // Update the event
    await window.gapi.client.calendar.events.update({
      calendarId: calendarId,
      eventId: eventId,
      resource: existingEvent,
    });

    // Update the last_synced timestamp
    const user = await getCurrentUser();
    if (user) {
      await supabase
        .from("task_calendar_events")
        .update({ last_synced: new Date().toISOString() })
        .eq("task_id", task.id)
        .eq("event_id", eventId);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating task in Google Calendar:", error);
    return {
      success: false,
      error: error.message || "Failed to update task in Google Calendar",
    };
  }
};

// Get calendar events for a task
export const getTaskCalendarEvents = async (taskId: string): Promise<any[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("task_calendar_events")
      .select("*")
      .eq("task_id", taskId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting task calendar events:", error);
    return [];
  }
};

// Add TypeScript interface for the Google API
declare global {
  interface Window {
    gapi: any;
  }
}
