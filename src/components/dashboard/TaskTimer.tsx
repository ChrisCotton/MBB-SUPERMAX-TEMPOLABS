import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, StopCircle, Clock, Save, History } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Task, TimeEntry } from "@/lib/types";
import { timerService } from "@/lib/timerService";
import { updateTask } from "@/lib/storage";

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

  useEffect(() => {
    if (!task) return;

    const loadTimerState = async () => {
      try {
        const { isRunning: running, elapsedTime: elapsed } =
          await timerService.getTimerState(task.id);
        setIsRunning(running);
        setElapsedTime(elapsed);

        const entries = await timerService.getTimeEntries(task.id);
        setTimeEntries(entries);

        if (running) {
          startTimerInterval();
        }
      } catch (error) {
        console.error("Error loading timer state:", error);
      }
    };

    loadTimerState();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [task?.id]);

  const startTimerInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = window.setInterval(async () => {
      if (task) {
        const { elapsedTime: newElapsedTime, isRunning: timerRunning } =
          await timerService.getTimerState(task.id);
        setElapsedTime(newElapsedTime);
        setIsRunning(timerRunning);
      }
    }, 500);
  };

  const startTimer = async () => {
    if (!task || isRunning) return;

    try {
      const success = await timerService.startTimer(task.id);
      if (success) {
        setIsRunning(true);
        startTimerInterval();
        window.dispatchEvent(
          new CustomEvent("task-timer-started", {
            detail: { taskId: task.id },
          }),
        );
      }
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  };

  const pauseTimer = async () => {
    if (!task || !isRunning) {
      console.log("Cannot pause: task is null or timer not running", {
        task,
        isRunning,
      });
      return;
    }

    try {
      console.log("Pausing timer for task:", task.id);
      const success = await timerService.pauseTimer(task.id);
      console.log("Timer pause result:", success);
      if (success) {
        setIsRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const entries = await timerService.getTimeEntries(task.id);
        setTimeEntries(entries);

        window.dispatchEvent(
          new CustomEvent("task-timer-stopped", {
            detail: { taskId: task.id },
          }),
        );
      }
    } catch (error) {
      console.error("Error pausing timer:", error);
    }
  };

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

        const entries = await timerService.getTimeEntries(task.id);
        setTimeEntries(entries);
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
    }
  };

  const saveTime = async () => {
    if (!task) return;

    try {
      // Convert to hours for consistency with estimated hours
      const timeSpentHours = parseFloat((elapsedTime / 3600).toFixed(2));

      // Calculate daily mental bank balance contribution
      const dailyBalanceContribution = parseFloat(
        (task.hourlyRate * timeSpentHours).toFixed(2),
      );

      // Save the time to the task
      const success = await timerService.saveTimeToTask(
        task.id,
        timeSpentHours,
      );

      if (success) {
        // Update local task state with the new daily balance
        if (task) {
          const updatedDailyBalance =
            (task.dailyBalance || 0) + dailyBalanceContribution;
          task.dailyBalance = updatedDailyBalance;
        }

        // Notify parent component
        onTimeLogged(task.id, timeSpentHours);

        // Reset timer state
        setSavedTime(elapsedTime);
        setElapsedTime(0);
        setShowSavePrompt(false);

        // Refresh time entries
        const entries = await timerService.getTimeEntries(task.id);
        setTimeEntries(entries);
      }
    } catch (error) {
      console.error("Error saving time:", error);
    }
  };

  const discardTime = () => {
    setShowSavePrompt(false);
  };

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
    <Card className="w-full glass-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium glow-text">Task Timer</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track time spent on this task
            </p>
          </div>
          <Badge variant="outline" className="ml-2 glass">
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
          <div className="glass-card-inner p-4 rounded-md">
            <h3 className="font-medium text-lg mb-1 glow-text">{task.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {task.description || "No description"}
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary" className="glass">
                Estimated: {task.estimatedHours} hrs
              </Badge>
              {task.actualTimeSpent !== undefined && (
                <Badge variant="secondary" className="glass">
                  Logged: {task.actualTimeSpent.toFixed(2)} hrs
                </Badge>
              )}
              <Badge variant="outline" className="glass">${task.hourlyRate}/hr</Badge>
              {task.dailyBalance !== undefined && (
                <div className="mt-2 p-2 glass-card-inner rounded-md">
                  <p className="text-sm font-medium glow-text">
                    Today's Balance For This Task: $
                    {task.dailyBalance.toFixed(2)}
                  </p>
                </div>
              )}
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
