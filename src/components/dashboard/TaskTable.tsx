import React, { useState, useEffect } from "react";
import { Task, Category } from "@/lib/types";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  MoreHorizontal,
  Edit,
  Trash,
  CheckCircle,
  Clock,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

interface TaskTableProps {
  tasks: Task[];
  categories: Category[];
  selectedTasks: string[];
  tasksInProgress: string[];
  toggleTaskSelection: (taskId: string) => void;
  toggleAllTasks: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onStartTimer: (task: Task) => void;
}

type SortField =
  | "title"
  | "category"
  | "priority"
  | "hourlyRate"
  | "estimatedHours"
  | "value"
  | "status";

interface SortState {
  field: SortField;
  direction: "asc" | "desc";
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  categories,
  selectedTasks,
  tasksInProgress,
  toggleTaskSelection,
  toggleAllTasks,
  onEdit,
  onDelete,
  onComplete,
  onStartTimer,
}) => {
  // Default sort by priority, highest to lowest
  const [sortState, setSortState] = useState<SortState>({
    field: "priority",
    direction: "desc",
  });

  const handleSort = (field: SortField) => {
    setSortState((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const calculateValue = (hourlyRate: number, estimatedHours: number) => {
    return (hourlyRate * estimatedHours).toFixed(2);
  };

  const getSortIcon = (field: SortField) => {
    if (sortState.field !== field) return null;
    return sortState.direction === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 inline" />
    );
  };

  // Sort tasks based on current sort state
  const sortedTasks = [...tasks].sort((a, b) => {
    const direction = sortState.direction === "asc" ? 1 : -1;

    switch (sortState.field) {
      case "title":
        return a.title.localeCompare(b.title) * direction;

      case "category":
        const catA =
          categories.find((cat) => cat.id === a.category)?.name || "";
        const catB =
          categories.find((cat) => cat.id === b.category)?.name || "";
        return catA.localeCompare(catB) * direction;

      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityA = priorityOrder[a.priority || "medium"] || 2;
        const priorityB = priorityOrder[b.priority || "medium"] || 2;
        return (priorityA - priorityB) * direction;

      case "hourlyRate":
        return (a.hourlyRate - b.hourlyRate) * direction;

      case "estimatedHours":
        return (a.estimatedHours - b.estimatedHours) * direction;

      case "value":
        const valueA = a.hourlyRate * a.estimatedHours;
        const valueB = b.hourlyRate * b.estimatedHours;
        return (valueA - valueB) * direction;

      case "status":
        return (Number(a.completed) - Number(b.completed)) * direction;

      default:
        return 0;
    }
  });

  return (
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
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("title")}
            >
              Task {getSortIcon("title")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("category")}
            >
              Category {getSortIcon("category")}
            </TableHead>
            <TableHead
              className="text-center cursor-pointer"
              onClick={() => handleSort("priority")}
            >
              Priority {getSortIcon("priority")}
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => handleSort("hourlyRate")}
            >
              Hourly Rate {getSortIcon("hourlyRate")}
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => handleSort("estimatedHours")}
            >
              Hours {getSortIcon("estimatedHours")}
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => handleSort("value")}
            >
              Value {getSortIcon("value")}
            </TableHead>
            <TableHead
              className="text-center cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Status {getSortIcon("status")}
            </TableHead>
            <TableHead className="w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="h-24 text-center text-muted-foreground"
              >
                No tasks found. Add a new task to get started.
              </TableCell>
            </TableRow>
          ) : (
            sortedTasks.map((task) => (
              <TableRow
                key={task.id}
                className={task.completed ? "bg-muted/50" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => {
                      if (checked && !task.completed) {
                        import("@/lib/storage").then(async ({ updateTask }) => {
                          try {
                            const updated = await updateTask(task.id, {
                              completed: true,
                              completedAt: new Date().toISOString(),
                            });
                            if (updated) {
                              window.dispatchEvent(
                                new CustomEvent("task-updated"),
                              );
                              onComplete(task.id);
                            }
                          } catch (error) {
                            console.error("Error completing task:", error);
                          }
                        });
                      } else if (checked === false && task.completed) {
                        import("@/lib/storage").then(async ({ updateTask }) => {
                          try {
                            const updated = await updateTask(task.id, {
                              completed: false,
                              completedAt: undefined,
                            });
                            if (updated) {
                              window.dispatchEvent(
                                new CustomEvent("task-updated"),
                              );
                            }
                          } catch (error) {
                            console.error("Error unchecking task:", error);
                          }
                        });
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
                    {categories.find((cat) => cat.id === task.category)?.name ||
                      "Unknown Category"}
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
                <TableCell className="text-right">${task.hourlyRate}</TableCell>
                <TableCell className="text-right">
                  {task.estimatedHours}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${calculateValue(task.hourlyRate, task.estimatedHours)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant={task.completed ? "success" : "secondary"}>
                      {task.completed ? "Completed" : "Pending"}
                    </Badge>
                    {tasksInProgress.includes(task.id) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="animate-pulse">
                              <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Timer running</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
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
                          <DropdownMenuItem onClick={() => onComplete(task.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Mark as Complete</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onStartTimer(task);
                            }}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            <span>
                              {tasksInProgress.includes(task.id)
                                ? "View Timer"
                                : "Start Timer"}
                            </span>
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
  );
};

export default TaskTable;
