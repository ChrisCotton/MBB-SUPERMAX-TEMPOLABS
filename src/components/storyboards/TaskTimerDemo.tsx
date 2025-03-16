import React, { useState } from "react";
import TaskTimer from "@/components/dashboard/TaskTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TaskTimerDemo = () => {
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const sampleTasks = [
    {
      id: "1",
      title: "Complete project proposal",
      description: "Draft and finalize the project proposal document",
      category: "1",
      hourlyRate: 75,
      estimatedHours: 3,
      completed: false,
      createdAt: "2023-06-15T10:30:00Z",
      priority: "high",
    },
    {
      id: "2",
      title: "Morning meditation",
      description: "Practice mindfulness meditation",
      category: "2",
      hourlyRate: 50,
      estimatedHours: 0.5,
      completed: false,
      createdAt: "2023-06-15T08:00:00Z",
      priority: "medium",
    },
    {
      id: "3",
      title: "Client meeting preparation",
      description: "Prepare slides and talking points for client meeting",
      category: "1",
      hourlyRate: 100,
      estimatedHours: 2,
      completed: false,
      createdAt: "2023-06-16T09:15:00Z",
      priority: "medium",
    },
  ];

  const handleTimeLogged = (taskId: string, timeSpent: number) => {
    console.log(`Logged ${timeSpent} hours for task ${taskId}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Task Timer Demo</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select a Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sampleTasks.map((task) => (
                    <Button
                      key={task.id}
                      variant={
                        selectedTask?.id === task.id ? "default" : "outline"
                      }
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {task.estimatedHours} hrs · ${task.hourlyRate}/hr
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <TaskTimer
              task={selectedTask}
              onTimeLogged={handleTimeLogged}
              onClose={() => setSelectedTask(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTimerDemo;
