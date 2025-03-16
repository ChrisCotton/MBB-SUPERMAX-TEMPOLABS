import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, StopCircle, Clock, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Task } from "@/lib/types";
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
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

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

  // Start the timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      timerRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          const elapsedSeconds = Math.floor(
            (Date.now() - startTimeRef.current) / 1000,
          );
          setElapsedTime(elapsedSeconds);
        }
      }, 1000);
    }
  };

  // Pause the timer
  const pauseTimer = () => {
    if (isRunning && timerRef.current) {
      setIsRunning(false);
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Stop the timer and prompt to save
  const stopTimer = () => {
    pauseTimer();
    if (elapsedTime > 0) {
      setShowSavePrompt(true);
    }
  };

  // Save the logged time
  const saveTime = async () => {
    if (!task) return;

    try {
      // Convert to hours for consistency with estimated hours
      const timeSpentHours = parseFloat((elapsedTime / 3600).toFixed(2));

      // Update the task with the actual time spent
      await updateTask(task.id, {
        actualTimeSpent: (task.actualTimeSpent || 0) + timeSpentHours,
      });

      // Notify parent component
      onTimeLogged(task.id, timeSpentHours);

      // Reset timer state
      setSavedTime(savedTime + elapsedTime);
      setElapsedTime(0);
      setShowSavePrompt(false);
      startTimeRef.current = null;
    } catch (error) {
      console.error("Error saving time:", error);
    }
  };

  // Discard the current timer session
  const discardTime = () => {
    setElapsedTime(0);
    setShowSavePrompt(false);
    startTimeRef.current = null;
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Reset timer when task changes
  useEffect(() => {
    setElapsedTime(0);
    setSavedTime(0);
    setIsRunning(false);
    setShowSavePrompt(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
  }, [task?.id]);

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
            {task.completed ? "Completed" : "In Progress"}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTimer;
