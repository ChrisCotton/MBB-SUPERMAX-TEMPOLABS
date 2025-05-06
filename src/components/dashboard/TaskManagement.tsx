import React, { useState, useEffect } from "react";
import {
  getTasks,
  saveTasks,
  addTask,
  updateTask,
  deleteTask,
  getCategories,
} from "@/lib/storage";
import { Task, Category } from "@/lib/types";
import { Plus, Filter, Search, Check, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import TaskTimer from "./TaskTimer";

// Task interface is now imported from @/lib/types

interface TaskManagementProps {
  tasks?: Task[];
}

const TaskManagement = ({ tasks: initialTasks }: TaskManagementProps = {}) => {
  // Default tasks if none are provided
  const defaultTasks = [
    {
      id: "1",
      title: "Complete project proposal",
      description: "Draft and finalize the project proposal document",
      category: "Work",
      hourlyRate: 75,
      estimatedHours: 3,
      completed: false,
      createdAt: "2023-06-15T10:30:00Z",
      priority: "high",
      dueDate: "2023-06-20",
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
      priority: "medium",
      completedAt: "2023-06-15T08:30:00Z",
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
      priority: "medium",
      dueDate: "2023-06-18",
    },
  ];

  const [tasks, setTasks] = useState<Task[]>(initialTasks || defaultTasks);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load tasks and categories from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTasks = await getTasks();
        if (storedTasks.length > 0) {
          setTasks(storedTasks);
        } else if (initialTasks || defaultTasks) {
          // If no stored tasks but we have initial ones, save them
          await saveTasks(initialTasks || defaultTasks);
        }

        const storedCategories = await getCategories();
        setCategories(storedCategories);
      } catch (error) {
        console.error("Error loading tasks and categories:", error);
      }
    };

    loadData();

    // Listen for task updates
    const handleTaskUpdated = async () => {
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
    };

    window.addEventListener("task-updated", handleTaskUpdated);

    return () => {
      window.removeEventListener("task-updated", handleTaskUpdated);
    };
  }, []);

  // Save tasks to storage whenever they change
  useEffect(() => {
    const saveTasksToStorage = async () => {
      // Check for duplicate tasks before saving
      const uniqueTasks = tasks.reduce((acc: Task[], current) => {
        // Check if task with same title and description already exists in the accumulator
        const isDuplicate = acc.some(
          (item) =>
            item.title === current.title &&
            item.description === current.description &&
            item.category === current.category &&
            item.hourlyRate === current.hourlyRate &&
            item.estimatedHours === current.estimatedHours,
        );

        if (!isDuplicate) {
          acc.push(current);
        }

        return acc;
      }, []);

      // Only update state if we found and removed duplicates
      if (uniqueTasks.length !== tasks.length) {
        setTasks(uniqueTasks);
      }

      await saveTasks(uniqueTasks);
    };
    saveTasksToStorage();
  }, [tasks]);

  // Update task rates when category rates change
  useEffect(() => {
    if (categories.length > 0) {
      const updatedTasks = tasks.map((task) => {
        const category = categories.find((cat) => cat.id === task.category);
        if (category) {
          return { ...task, hourlyRate: category.hourlyRate };
        }
        return task;
      });

      // Only update if there are actual changes
      if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
      }
    }
  }, [categories]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "value">("date");
  const [filterPriority, setFilterPriority] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [timerTask, setTimerTask] = useState<Task | null>(null);
  const [showTimer, setShowTimer] = useState(false);

  // Filter tasks based on search query, active tab, and priority
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "completed"
          ? task.completed
          : activeTab === "pending"
            ? !task.completed
            : true;
    const matchesPriority =
      filterPriority === "all" ? true : task.priority === filterPriority;

    return matchesSearch && matchesTab && matchesPriority;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (
        priorityOrder[a.priority || "medium"] -
        priorityOrder[b.priority || "medium"]
      );
    } else if (sortBy === "value") {
      const aValue = a.hourlyRate * a.estimatedHours;
      const bValue = b.hourlyRate * b.estimatedHours;
      return bValue - aValue;
    } else {
      // Default sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleAddTask = async (formData: any) => {
    try {
      // Check if a task with the same title and description already exists
      const isDuplicate = tasks.some(
        (task) =>
          task.title === formData.title &&
          task.description === (formData.description || "") &&
          task.category === formData.category &&
          task.hourlyRate === parseFloat(formData.hourlyRate) &&
          task.estimatedHours === parseFloat(formData.estimatedHours),
      );

      if (isDuplicate) {
        console.warn("Duplicate task detected. Task not added.");
        setIsAddTaskDialogOpen(false);
        return;
      }

      const newTask = await addTask({
        title: formData.title,
        description: formData.description || "",
        category: formData.category,
        hourlyRate: parseFloat(formData.hourlyRate),
        estimatedHours: parseFloat(formData.estimatedHours),
        completed: formData.status === "completed",
        priority: formData.priority || "medium",
        dueDate: formData.dueDate || undefined,
      });

      setTasks([...tasks, newTask]);
      setIsAddTaskDialogOpen(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleUpdateTask = async (formData: any) => {
    if (!currentTask) return;

    try {
      const updatedTaskData = {
        title: formData.title,
        description: formData.description || "",
        category: formData.category,
        hourlyRate: parseFloat(formData.hourlyRate),
        estimatedHours: parseFloat(formData.estimatedHours),
        priority: formData.priority || "medium",
        dueDate: formData.dueDate || undefined,
        completed: formData.status === "completed",
      };

      const updated = await updateTask(currentTask.id, updatedTaskData);

      if (updated) {
        const updatedTasks = tasks.map((task) =>
          task.id === currentTask.id ? { ...task, ...updatedTaskData } : task,
        );
        setTasks(updatedTasks);
      }

      setIsEditTaskDialogOpen(false);
      setCurrentTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await deleteTask(taskId);
      if (success) {
        setTasks(tasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const completedAt = new Date().toISOString();
      const updated = await updateTask(taskId, {
        completed: true,
        completedAt: completedAt,
      });

      if (updated) {
        const updatedTasks = tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: true,
                completedAt: completedAt,
              }
            : task,
        );
        setTasks(updatedTasks);

        // Update mental bank balance
        const completedTask = tasks.find((task) => task.id === taskId);
        if (completedTask) {
          const taskValue =
            completedTask.hourlyRate * completedTask.estimatedHours;
          updateMentalBankBalance(taskValue);
        }
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // Function to update mental bank balance when task is completed
  const updateMentalBankBalance = async (amount: number) => {
    try {
      // Get current balance
      const { currentBalance, targetBalance } = await import("@/lib/api")
        .then(({ fetchMentalBankBalance }) => fetchMentalBankBalance())
        .catch(() =>
          import("@/lib/storage").then(({ getMentalBankBalance }) =>
            getMentalBankBalance(),
          ),
        );

      // Calculate new balance and progress
      const newBalance = currentBalance + amount;
      const progressPercentage = Math.round((newBalance / targetBalance) * 100);

      // Update balance in database/storage
      await import("@/lib/api")
        .then(({ updateMentalBankBalance }) =>
          updateMentalBankBalance({
            currentBalance: newBalance,
            progressPercentage: progressPercentage,
          }),
        )
        .catch(() =>
          import("@/lib/storage").then(({ updateMentalBankBalance }) =>
            updateMentalBankBalance({
              currentBalance: newBalance,
              progressPercentage: progressPercentage,
            }),
          ),
        );

      // Show completion animation/feedback
      showCompletionFeedback(amount);
    } catch (error) {
      console.error("Error updating mental bank balance:", error);
    }
  };

  // Function to show task completion feedback
  const showCompletionFeedback = (amount: number) => {
    // Create a celebration overlay
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black/30 flex items-center justify-center z-50";

    // Create the celebration animation container
    const animationContainer = document.createElement("div");
    animationContainer.className =
      "relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 overflow-hidden";

    // Add confetti effect
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      const size = Math.random() * 10 + 5;
      const color = [
        "bg-green-500",
        "bg-blue-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
      ][Math.floor(Math.random() * 6)];

      confetti.className = `absolute ${color} rounded-full opacity-70`;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `${Math.random() * 100}%`;
      confetti.style.transform = `scale(0)`;
      confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s ease-out forwards`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;

      animationContainer.appendChild(confetti);
    }

    // Add celebration content
    const content = document.createElement("div");
    content.className = "text-center z-10 relative";
    content.innerHTML = `
      <div class="mb-4 flex justify-center">
        <div class="rounded-full bg-green-100 p-3 animate-bounce">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2 animate-pulse">Task Completed!</h2>
      <div class="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
        <p class="text-lg font-medium text-gray-700">Added to Mental Bank Balance:</p>
        <p class="text-3xl font-bold text-green-600 animate-[counter_2s_ease-out_forwards]" id="amount-counter">$0.00</p>
      </div>
      <p class="text-gray-600 italic">Keep up the great work!</p>
      <button class="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors" id="close-celebration">Continue</button>
    `;

    animationContainer.appendChild(content);
    overlay.appendChild(animationContainer);
    document.body.appendChild(overlay);

    // Add the CSS animation for confetti
    const style = document.createElement("style");
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(-10px) scale(0) rotate(0deg); }
        50% { transform: translateY(100px) scale(1) rotate(180deg); opacity: 1; }
        100% { transform: translateY(200px) scale(0.5) rotate(360deg); opacity: 0; }
      }
      @keyframes counter {
        0% { content: "$0.00"; }
        100% { content: "${amount.toFixed(2)}"; }
      }
    `;
    document.head.appendChild(style);

    // Animate the counter
    const counter = document.getElementById("amount-counter");
    if (counter) {
      let current = 0;
      const increment = amount / 50;
      const interval = setInterval(() => {
        current += increment;
        if (current > amount) current = amount;
        counter.textContent = `$${current.toFixed(2)}`;
        if (current >= amount) clearInterval(interval);
      }, 40);
    }

    // Close button functionality
    const closeButton = document.getElementById("close-celebration");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        overlay.classList.add(
          "opacity-0",
          "transition-opacity",
          "duration-300",
        );
        setTimeout(() => {
          document.body.removeChild(overlay);
          document.head.removeChild(style);
        }, 300);
      });
    }

    // Auto close after 8 seconds
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        overlay.classList.add(
          "opacity-0",
          "transition-opacity",
          "duration-300",
        );
        setTimeout(() => {
          if (document.body.contains(overlay))
            document.body.removeChild(overlay);
          if (document.head.contains(style)) document.head.removeChild(style);
        }, 300);
      }
    }, 8000);
  };

  const handleStartTimer = (task: Task) => {
    setTimerTask(task);
    setShowTimer(true);

    // Make sure we don't mark the task as complete when starting the timer
    // Just show the timer for the selected task
  };

  const handleTimeLogged = async (taskId: string, timeSpent: number) => {
    // Refresh tasks after time is logged
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
  };

  return (
    <div className="w-full glass-card p-6 rounded-lg shadow-sm">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold glow-text">Task Management</h2>
          <div className="flex gap-2">
            {showTimer ? (
              <Button
                variant="outline"
                onClick={() => setShowTimer(false)}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Hide Timer
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowTimer(true)}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Show Timer
              </Button>
            )}
            <Dialog
              open={isAddTaskDialogOpen}
              onOpenChange={setIsAddTaskDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 glass-button">
                  <Plus className="h-4 w-4" />
                  Add New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border border-white/10 bg-opacity-95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <TaskForm
                  onSubmit={handleAddTask}
                  onCancel={() => setIsAddTaskDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Search and filters */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Filter className="h-4 w-4" />
                      Filter & Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy("date")}>
                      {sortBy === "date" && <Check className="mr-2 h-4 w-4" />}
                      Date Created
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("priority")}>
                      {sortBy === "priority" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("value")}>
                      {sortBy === "value" && <Check className="mr-2 h-4 w-4" />}
                      Value
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filter Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterPriority("all")}>
                      {filterPriority === "all" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      All Priorities
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                      {filterPriority === "high" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      High Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterPriority("medium")}
                    >
                      {filterPriority === "medium" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Medium Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                      {filterPriority === "low" && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Low Priority
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Right column - Timer (conditionally rendered) */}
          {showTimer && (
            <div className="md:col-span-1">
              <TaskTimer
                task={timerTask}
                onClose={() => setShowTimer(false)}
                onTimeLogged={handleTimeLogged}
              />
            </div>
          )}
        </div>

        <Card className="glass-card-inner">
          <CardHeader className="px-6 py-4 border-b border-white/5">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <TaskList
              tasks={sortedTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onComplete={handleCompleteTask}
              onStartTimer={handleStartTimer}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit Task Dialog */}
      <Dialog
        open={isEditTaskDialogOpen}
        onOpenChange={setIsEditTaskDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {currentTask && (
            <TaskForm
              isEditing={true}
              initialData={{
                title: currentTask.title,
                description: currentTask.description,
                category: currentTask.category,
                hourlyRate: currentTask.hourlyRate.toString(),
                estimatedHours: currentTask.estimatedHours.toString(),
                priority: currentTask.priority || "medium",
                dueDate: currentTask.dueDate || "",
                status: currentTask.completed ? "completed" : "pending",
              }}
              onSubmit={handleUpdateTask}
              onCancel={() => {
                setIsEditTaskDialogOpen(false);
                setCurrentTask(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
