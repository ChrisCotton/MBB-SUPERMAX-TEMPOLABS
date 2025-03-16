import React from "react";
import CategoryDashboard from "@/components/dashboard/CategoryDashboard";

const CategoryDashboardDemo = () => {
  // Sample data for demonstration
  const sampleCategories = [
    { id: "1", name: "Work", hourlyRate: 75, tasksCount: 5 },
    { id: "2", name: "Personal Development", hourlyRate: 50, tasksCount: 3 },
    { id: "3", name: "Health", hourlyRate: 40, tasksCount: 2 },
    { id: "4", name: "Family", hourlyRate: 45, tasksCount: 1 },
    { id: "5", name: "Education", hourlyRate: 60, tasksCount: 4 },
  ];

  const sampleTasks = [
    {
      id: "1",
      title: "Complete project proposal",
      description: "Draft and finalize the project proposal document",
      category: "1", // Work
      hourlyRate: 75,
      estimatedHours: 3,
      completed: true,
      createdAt: "2023-06-15T10:30:00Z",
      priority: "high",
    },
    {
      id: "2",
      title: "Morning meditation",
      description: "Practice mindfulness meditation",
      category: "2", // Personal Development
      hourlyRate: 50,
      estimatedHours: 0.5,
      completed: true,
      createdAt: "2023-06-15T08:00:00Z",
      priority: "medium",
    },
    {
      id: "3",
      title: "Client meeting preparation",
      category: "1", // Work
      hourlyRate: 75,
      estimatedHours: 2,
      completed: false,
      createdAt: "2023-06-16T09:15:00Z",
      priority: "medium",
      description: "",
    },
    {
      id: "4",
      title: "Gym workout",
      category: "3", // Health
      hourlyRate: 40,
      estimatedHours: 1.5,
      completed: true,
      createdAt: "2023-06-16T17:00:00Z",
      priority: "medium",
      description: "",
    },
    {
      id: "5",
      title: "Family dinner",
      category: "4", // Family
      hourlyRate: 45,
      estimatedHours: 2,
      completed: true,
      createdAt: "2023-06-16T19:00:00Z",
      priority: "low",
      description: "",
    },
    {
      id: "6",
      title: "Online course lesson",
      category: "5", // Education
      hourlyRate: 60,
      estimatedHours: 1,
      completed: true,
      createdAt: "2023-06-17T14:00:00Z",
      priority: "medium",
      description: "",
    },
    {
      id: "7",
      title: "Project planning",
      category: "1", // Work
      hourlyRate: 75,
      estimatedHours: 4,
      completed: false,
      createdAt: "2023-06-17T10:00:00Z",
      priority: "high",
      description: "",
    },
    {
      id: "8",
      title: "Read business book",
      category: "2", // Personal Development
      hourlyRate: 50,
      estimatedHours: 2,
      completed: false,
      createdAt: "2023-06-18T20:00:00Z",
      priority: "low",
      description: "",
    },
    {
      id: "9",
      title: "Meal prep for the week",
      category: "3", // Health
      hourlyRate: 40,
      estimatedHours: 2,
      completed: false,
      createdAt: "2023-06-18T16:00:00Z",
      priority: "medium",
      description: "",
    },
    {
      id: "10",
      title: "Study programming",
      category: "5", // Education
      hourlyRate: 60,
      estimatedHours: 3,
      completed: true,
      createdAt: "2023-06-19T18:00:00Z",
      priority: "high",
      description: "",
    },
    {
      id: "11",
      title: "Team meeting",
      category: "1", // Work
      hourlyRate: 75,
      estimatedHours: 1,
      completed: true,
      createdAt: "2023-06-19T09:00:00Z",
      priority: "medium",
      description: "",
    },
    {
      id: "12",
      title: "Language practice",
      category: "5", // Education
      hourlyRate: 60,
      estimatedHours: 1,
      completed: false,
      createdAt: "2023-06-20T17:00:00Z",
      priority: "low",
      description: "",
    },
    {
      id: "13",
      title: "Journal writing",
      category: "2", // Personal Development
      hourlyRate: 50,
      estimatedHours: 0.5,
      completed: true,
      createdAt: "2023-06-20T22:00:00Z",
      priority: "low",
      description: "",
    },
    {
      id: "14",
      title: "Project implementation",
      category: "1", // Work
      hourlyRate: 75,
      estimatedHours: 6,
      completed: false,
      createdAt: "2023-06-21T08:00:00Z",
      priority: "high",
      description: "",
    },
    {
      id: "15",
      title: "Coding practice",
      category: "5", // Education
      hourlyRate: 60,
      estimatedHours: 2,
      completed: true,
      createdAt: "2023-06-21T19:00:00Z",
      priority: "medium",
      description: "",
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CategoryDashboard tasks={sampleTasks} categories={sampleCategories} />
    </div>
  );
};

export default CategoryDashboardDemo;
