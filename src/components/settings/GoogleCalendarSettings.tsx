import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Check, X, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const GoogleCalendarSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    syncTasks: true,
    syncGoals: true,
    syncJournalReminders: false,
    calendarId: "",
    autoCreateEvents: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("You must be logged in to access calendar settings");
          setIsLoading(false);
          return;
        }

        // Fetch calendar settings from database
        const { data, error } = await supabase
          .from("google_calendar_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setIsConnected(data.is_connected || false);
          setSettings({
            syncTasks: data.sync_tasks || true,
            syncGoals: data.sync_goals || true,
            syncJournalReminders: data.sync_journal_reminders || false,
            calendarId: data.calendar_id || "",
            autoCreateEvents: data.auto_create_events || true,
          });
        }
      } catch (error: any) {
        console.error("Error fetching calendar settings:", error);
        setError(error.message || "Failed to load calendar settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // In a real implementation, this would redirect to Google OAuth
      // For demo purposes, we'll simulate a successful connection
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to connect your calendar");
        return;
      }

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from("google_calendar_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      // Simulate successful connection
      const calendarData = {
        user_id: user.id,
        is_connected: true,
        sync_tasks: settings.syncTasks,
        sync_goals: settings.syncGoals,
        sync_journal_reminders: settings.syncJournalReminders,
        calendar_id: settings.calendarId || "primary",
        auto_create_events: settings.autoCreateEvents,
        last_synced: new Date().toISOString(),
      };

      let result;
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from("google_calendar_settings")
          .update(calendarData)
          .eq("id", existingSettings.id);
      } else {
        // Insert new settings
        result = await supabase
          .from("google_calendar_settings")
          .insert(calendarData);
      }

      if (result.error) throw result.error;

      setIsConnected(true);
      setSuccess("Successfully connected to Google Calendar!");

      // Simulate fetching calendar list
      setTimeout(() => {
        setSettings((prev) => ({
          ...prev,
          calendarId: "primary",
        }));
      }, 1000);
    } catch (error: any) {
      console.error("Error connecting to Google Calendar:", error);
      setError(error.message || "Failed to connect to Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to disconnect your calendar");
        return;
      }

      // Update database to disconnect
      const { error } = await supabase
        .from("google_calendar_settings")
        .update({ is_connected: false })
        .eq("user_id", user.id);

      if (error) throw error;

      setIsConnected(false);
      setSuccess("Successfully disconnected from Google Calendar");
    } catch (error: any) {
      console.error("Error disconnecting from Google Calendar:", error);
      setError(error.message || "Failed to disconnect from Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to save settings");
        return;
      }

      // Update settings in database
      const { error } = await supabase
        .from("google_calendar_settings")
        .update({
          sync_tasks: settings.syncTasks,
          sync_goals: settings.syncGoals,
          sync_journal_reminders: settings.syncJournalReminders,
          calendar_id: settings.calendarId,
          auto_create_events: settings.autoCreateEvents,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setSuccess("Settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving calendar settings:", error);
      setError(error.message || "Failed to save calendar settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // In a real implementation, this would trigger a sync with Google Calendar
      // For demo purposes, we'll simulate a successful sync
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update last synced timestamp
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("google_calendar_settings")
          .update({ last_synced: new Date().toISOString() })
          .eq("user_id", user.id);
      }

      setSuccess("Calendar synced successfully!");
    } catch (error: any) {
      console.error("Error syncing with Google Calendar:", error);
      setError(error.message || "Failed to sync with Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="glass-card shadow-md border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          Google Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-full p-1 bg-background">
              {isConnected ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
            <span className="font-medium">
              {isConnected ? "Connected" : "Not Connected"}
            </span>
          </div>

          {isConnected ? (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isLoading}
              className="glass-input hover:glow-border"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="glass-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect to Google Calendar"
              )}
            </Button>
          )}
        </div>

        <Separator className="my-4 bg-white/10" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sync Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="syncTasks" className="flex-1">
                Sync tasks to calendar
              </Label>
              <Switch
                id="syncTasks"
                checked={settings.syncTasks}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, syncTasks: checked })
                }
                disabled={!isConnected || isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="syncGoals" className="flex-1">
                Sync goals to calendar
              </Label>
              <Switch
                id="syncGoals"
                checked={settings.syncGoals}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, syncGoals: checked })
                }
                disabled={!isConnected || isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="syncJournalReminders" className="flex-1">
                Add journal reminders to calendar
              </Label>
              <Switch
                id="syncJournalReminders"
                checked={settings.syncJournalReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, syncJournalReminders: checked })
                }
                disabled={!isConnected || isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoCreateEvents" className="flex-1">
                Automatically create calendar events
              </Label>
              <Switch
                id="autoCreateEvents"
                checked={settings.autoCreateEvents}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoCreateEvents: checked })
                }
                disabled={!isConnected || isLoading}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Calendar Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="calendarId">Default Calendar</Label>
            <Input
              id="calendarId"
              value={settings.calendarId}
              onChange={(e) =>
                setSettings({ ...settings, calendarId: e.target.value })
              }
              placeholder="primary"
              disabled={!isConnected || isLoading}
              className="glass-input"
            />
            <p className="text-sm text-muted-foreground">
              Enter "primary" for your main calendar or use a specific calendar
              ID
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={!isConnected || isLoading}
            className="glass-input hover:glow-border"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync Now
          </Button>

          <Button
            onClick={handleSaveSettings}
            disabled={!isConnected || isLoading}
            className="glass-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
