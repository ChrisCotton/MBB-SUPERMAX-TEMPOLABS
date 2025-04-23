import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, StopCircle, Clock, Save, History } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Task, TimeEntry } from "@/lib/types";
import { timerService } from "@/lib/timerService";

interface TaskTimerProps {
  task?: Task | null;
  onClose?: () => void;
  onTimeLogged?: (taskId: string, timeSpent: number) => void;
}

const TaskTimer = ({
  task = null,
  onClose = () => {},
  onTimeLogged = () => {},
}: TaskTimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const timerRef = useRef<number | null>(null);

  // Format time as HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  // Load timer state from Supabase when task changes
  useEffect(() => {
    if (!task) return;

    const loadTimerState = async () => {
      try {
        // Get the current timer state
        const { isRunning: running, elapsedTime: elapsed } =
          await timerService.getTimerState(task.id);
        setIsRunning(running);
        setElapsedTime(elapsed);

        // Get time entries
        const entries = await timerService.getTimeEntries(task.id);
        setTimeEntries(entries);

        // If the timer is running, start the interval
        if (running) {
          startTimerInterval();
        }
      } catch (error) {
        console.error("Error loading timer state:", error);
      }
    };

    loadTimerState();

    // Clean up interval on unmount or when task changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [task?.id]);

  // Start the timer interval to update the UI
  const startTimerInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(async () => {
      if (task) {
        const { elapsedTime: newElapsedTime } =
          await timerService.getTimerState(task.id);
        setElapsedTime(newElapsedTime);
      }
    }, 1000);
  };

  // Start the timer
  const startTimer = async () => {
    if (!task || isRunning) return;

    try {
      const success = await timerService.startTimer(task.id);
      if (success) {
        setIsRunning(true);
        startTimerInterval();
      }
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  };

  // Pause the timer
  const pauseTimer = async () => {
    if (!task || !isRunning) return;

    try {
      const success = await timerService.pauseTimer(task.id);
      if (success) {
        setIsRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Refresh time entries
        const entries = await timerService.getTimeEntries(task.id);
        setTimeEntries(entries);
      }
    } catch (error) {
      console.error("Error pausing timer:", error);
    }
  };

  // Stop the timer and prompt to save
  const stopTimer = async () => {
    if (!task) return;

    try {
      const success = await timerService.stopTimer(task.id);
      if (success) {
        setIsRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setShowSavePrompt(true);

        // Refresh time entries
        const entries = await timerService.getTimeEntries(task.id);
        setTimeEntries(entries);
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
    }
  };

  // Save the logged time
  const saveTime = async () => {
    if (!task) return;

    try {
      // Convert to hours for consistency with estimated hours
      const timeSpentHours = parseFloat((elapsedTime / 3600).toFixed(2));

      // Save the time to the task
      const success = await timerService.saveTimeToTask(
        task.id,
        timeSpentHours,
      );
      if (success) {
        // Notify parent component
        onTimeLogged(task.id, timeSpentHours);

        // Reset timer state
        setSavedTime(elapsedTime);
        setElapsedTime(0);
        setShowSavePrompt(false);
      }
    } catch (error) {
      console.error("Error saving time:", error);
    }
  };

  // Discard the current timer session
  const discardTime = () => {
    setShowSavePrompt(false);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (!task) {
    return (
      <Card className="w-full bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Task Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Select a task to start tracking time
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">Task Timer</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track time spent on this task
            </p>
          </div>
          <Badge variant="outline" className="ml-2">
            {task.completed
              ? "Completed"
              : task.inProgress
                ? "Timing"
                : "In Progress"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-md">
            <h3 className="font-medium text-lg mb-1">{task.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {task.description || "No description"}
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">
                Estimated: {task.estimatedHours} hrs
              </Badge>
              {task.actualTimeSpent !== undefined && (
                <Badge variant="secondary">
                  Logged: {task.actualTimeSpent.toFixed(2)} hrs
                </Badge>
              )}
              <Badge variant="outline">${task.hourlyRate}/hr</Badge>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-4xl font-mono font-bold mb-4">
              {formatTime(elapsedTime)}
            </div>

            {showSavePrompt ? (
              <div className="space-y-4 w-full">
                <p className="text-center text-sm">
                  Save {formatTime(elapsedTime)} to this task?
                </p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" size="sm" onClick={discardTime}>
                    Discard
                  </Button>
                  <Button size="sm" onClick={saveTime}>
                    <Save className="mr-1 h-4 w-4" />
                    Save Time
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                {isRunning ? (
                  <Button variant="outline" size="sm" onClick={pauseTimer}>
                    <Pause className="mr-1 h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={startTimer}>
                    <Play className="mr-1 h-4 w-4" />
                    Start
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={stopTimer}
                  disabled={elapsedTime === 0}
                >
                  <StopCircle className="mr-1 h-4 w-4" />
                  Stop
                </Button>
              </div>
            )}
          </div>

          {savedTime > 0 && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200 text-sm text-center">
              <p className="text-green-700">
                {formatTime(savedTime)} saved to this task
              </p>
            </div>
          )}

          {timeEntries.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Recent Time Entries</h4>
              </div>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {timeEntries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between p-2 bg-muted/30 rounded"
                  >
                    <span>
                      {new Date(entry.startTime).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-mono">
                      {formatTime(entry.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTimer;
