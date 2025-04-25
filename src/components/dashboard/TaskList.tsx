import React, { useState, useEffect } from "react";
import { getCategories } from "@/lib/storage";
import { Category, Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TaskTable from "./TaskTable";

interface TaskListProps {
  tasks?: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  onStartTimer?: (task: Task) => void;
}

const TaskList = ({
  tasks = [
    {
      id: "1",
      title: "Complete project proposal",
      description: "Draft and finalize the project proposal document",
      category: "Work",
      hourlyRate: 75,
      estimatedHours: 3,
      completed: false,
      createdAt: "2023-06-15T10:30:00Z",
      priority: "medium",
    },
    {
      id: "2",
      title: "Morning meditation",
      description: "Practice mindfulness meditation",
      category: "Personal Development",
      hourlyRate: 50,
      estimatedHours: 0.5,
      completed: true,
      createdAt: "2023-06-15T08:00:00Z",
      priority: "low",
    },
    {
      id: "3",
      title: "Client meeting preparation",
      description: "Prepare slides and talking points for client meeting",
      category: "Work",
      hourlyRate: 100,
      estimatedHours: 2,
      completed: false,
      createdAt: "2023-06-16T09:15:00Z",
      priority: "high",
    },
  ],
  onEdit = () => {},
  onDelete = () => {},
  onComplete = () => {},
  onStartTimer = () => {},
}: TaskListProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasksInProgress, setTasksInProgress] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const storedCategories = await getCategories();
      setCategories(storedCategories);
    };
    loadCategories();

    const intervalId = setInterval(loadCategories, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const checkTasksInProgress = async () => {
      try {
        const { getTasks } = await import("@/lib/storage");
        const allTasks = await getTasks();
        const inProgressTaskIds = allTasks
          .filter((task) => task.inProgress)
          .map((task) => task.id);
        setTasksInProgress(inProgressTaskIds);
      } catch (error) {
        console.error("Error checking tasks in progress:", error);
      }
    };

    checkTasksInProgress();

    const intervalId = setInterval(checkTasksInProgress, 2000);

    const handleTaskUpdate = () => checkTasksInProgress();
    window.addEventListener("task-timer-started", handleTaskUpdate);
    window.addEventListener("task-timer-stopped", handleTaskUpdate);
    window.addEventListener("task-updated", handleTaskUpdate);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("task-timer-started", handleTaskUpdate);
      window.removeEventListener("task-timer-stopped", handleTaskUpdate);
      window.removeEventListener("task-updated", handleTaskUpdate);
    };
  }, []);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const toggleAllTasks = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map((task) => task.id));
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskTable
          tasks={tasks}
          categories={categories}
          selectedTasks={selectedTasks}
          tasksInProgress={tasksInProgress}
          toggleTaskSelection={toggleTaskSelection}
          toggleAllTasks={toggleAllTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
          onStartTimer={onStartTimer}
        />
      </CardContent>
    </Card>
  );
};

export default TaskList;
