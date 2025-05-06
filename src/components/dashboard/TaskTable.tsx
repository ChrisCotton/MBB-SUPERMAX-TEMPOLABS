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
import { Play, Edit, Trash2, CheckCircle } from "lucide-react";

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
    return category?.color || "#6b7280";
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="w-full overflow-auto">
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
            <TableHead>Rate</TableHead>
            <TableHead>Est. Hours</TableHead>
            <TableHead>Est. Value</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No tasks found. Create a new task to get started.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow
                key={task.id}
                className={task.completed ? "opacity-60 bg-gray-50" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                    aria-label={`Select task ${task.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
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
                <TableCell className={getPriorityColor(task.priority)}>
                  {task.priority || "Medium"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!task.completed && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onStartTimer(task)}
                        disabled={tasksInProgress.includes(task.id)}
                        className={`h-8 w-8 ${tasksInProgress.includes(task.id) ? "bg-green-100" : ""}`}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(task)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(task.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {!task.completed && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onComplete(task.id)}
                        className="h-8 w-8"
                      >
                        <CheckCircle className="h-4 w-4" />
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
