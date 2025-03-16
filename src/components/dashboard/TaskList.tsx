import React, { useState, useEffect } from "react";
import { getCategories } from "@/lib/storage";
import { Category } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import { Task } from "@/lib/types";

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
    },
  ],
  onEdit = () => {},
  onDelete = () => {},
  onComplete = () => {},
  onStartTimer = () => {},
}: TaskListProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories to display category names instead of IDs
  useEffect(() => {
    const loadCategories = async () => {
      const storedCategories = await getCategories();
      setCategories(storedCategories);
    };
    loadCategories();

    // Set up an interval to refresh categories periodically
    const intervalId = setInterval(loadCategories, 1000);
    return () => clearInterval(intervalId);
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

  const calculateValue = (hourlyRate: number, estimatedHours: number) => {
    return (hourlyRate * estimatedHours).toFixed(2);
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedTasks.length === tasks.length && tasks.length > 0
                    }
                    onCheckedChange={toggleAllTasks}
                    aria-label="Select all tasks"
                  />
                </TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Priority</TableHead>
                <TableHead className="text-right">Hourly Rate</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No tasks found. Add a new task to get started.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className={task.completed ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => {
                          if (checked && !task.completed) {
                            onComplete(task.id);
                          } else if (checked === false && task.completed) {
                            // If unchecking a completed task, mark it as pending
                            import("@/lib/storage").then(
                              async ({ updateTask }) => {
                                try {
                                  const updated = await updateTask(task.id, {
                                    completed: false,
                                  });
                                  if (updated) {
                                    // Refresh the task list
                                    window.dispatchEvent(
                                      new CustomEvent("task-updated"),
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error unchecking task:",
                                    error,
                                  );
                                }
                              },
                            );
                          }
                        }}
                        aria-label={`Select task ${task.title}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {task.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categories.find((cat) => cat.id === task.category)
                          ?.name || "Unknown Category"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {task.priority || "medium"}
                      </Badge>
                      {task.dueDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      ${task.hourlyRate}
                    </TableCell>
                    <TableCell className="text-right">
                      {task.estimatedHours}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${calculateValue(task.hourlyRate, task.estimatedHours)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={task.completed ? "success" : "secondary"}>
                        {task.completed ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!task.completed && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onComplete(task.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Mark as Complete</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onStartTimer(task)}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                <span>Start Timer</span>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => onEdit(task)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(task.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
