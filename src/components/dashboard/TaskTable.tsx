import React from "react";
import { Category, Task } from "@/lib/types";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Play,
  Edit,
  Trash2,
  CheckCircle,
  Pencil,
  Clock,
  Check,
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

const TaskTable = ({
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
}: TaskTableProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "#6b7280";
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="glass-card-inner">
      <Table>
        <TableHeader>
          <TableRow className="glass">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedTasks.length === tasks.length}
                onCheckedChange={toggleAllTasks}
                aria-label="Select all tasks"
              />
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Est. Hours</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-4 text-muted-foreground"
              >
                No tasks found. Create a new task to get started.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow
                key={task.id}
                className={`${task.completed ? "opacity-60" : ""} glass-card-inner bg-transparent`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                    aria-label={`Select task ${task.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium glow-text">
                  {task.title}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getCategoryColor(task.category),
                      }}
                    ></div>
                    {getCategoryName(task.category)}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(task.hourlyRate)}</TableCell>
                <TableCell>{task.estimatedHours}</TableCell>
                <TableCell>
                  {formatCurrency(task.hourlyRate * task.estimatedHours)}
                </TableCell>
                <TableCell
                  className={`${getPriorityColor(task.priority)} glass`}
                >
                  {task.priority || "Medium"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                      className="glass-button"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(task.id)}
                      className="glass-button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {!task.completed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onComplete(task.id)}
                        className="glass-button"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {!task.completed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStartTimer(task)}
                        className="glass-button"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
