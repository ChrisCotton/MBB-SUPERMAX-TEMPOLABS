import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '@/lib/types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import { getTasks, updateTask, addTask, deleteTask } from '@/lib/storage';

import TaskForm from './TaskForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'review', title: 'Review', tasks: [] },
    { id: 'completed', title: 'Completed', tasks: [] }
  ]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null);

  // Move loadTasks to a top-level function so it can be reused
  const loadTasks = async () => {
    const loadedTasks = await getTasks();
    setTasks(loadedTasks);
    // Distribute tasks into columns
    const newColumns = columns.map(column => ({
      ...column,
      tasks: loadedTasks.filter(task => task.status === column.id)
    }));
    setColumns(newColumns);
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line
  }, []);

  const onDragEnd = async (result: any) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    if (!sourceColumn || !destColumn) return;
    const sourceTasks = [...sourceColumn.tasks];
    const destTasks = source.droppableId === destination.droppableId 
      ? sourceTasks 
      : [...destColumn.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.status = destination.droppableId as TaskStatus;
    destTasks.splice(destination.index, 0, movedTask);
    const newColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, tasks: sourceTasks };
      }
      if (col.id === destination.droppableId) {
        return { ...col, tasks: destTasks };
      }
      return col;
    });
    setColumns(newColumns);
    try {
      await updateTask(movedTask.id, movedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      setColumns(columns);
    }
  };

  const handleAddTask = async (formData: any) => {
    try {
      await addTask({
        ...formData,
        status: 'todo',
        hourlyRate: parseFloat(formData.hourlyRate),
        estimatedHours: parseFloat(formData.estimatedHours),
        completed: formData.status === 'completed',
      });
      // Always reload from backend after adding
      await loadTasks();
      setShowAddTaskDialog(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setShowEditTaskDialog(true);
  };

  const handleUpdateTask = async (formData: any) => {
    if (!currentTask) return;
    try {
      await updateTask(currentTask.id, {
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate),
        estimatedHours: parseFloat(formData.estimatedHours),
        completed: formData.status === 'completed',
        status: formData.status === 'completed' ? 'completed' : formData.status || currentTask.status,
      });
      await loadTasks();
      setShowEditTaskDialog(false);
      setCurrentTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const requestDeleteTask = (taskId: string) => {
    setPendingDeleteTaskId(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    if (!pendingDeleteTaskId) return;
    try {
      await deleteTask(pendingDeleteTaskId);
      await loadTasks();
      setShowEditTaskDialog(false);
      setCurrentTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setShowDeleteConfirm(false);
      setPendingDeleteTaskId(null);
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteTaskId(null);
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <Button className="flex items-center gap-2" onClick={() => setShowAddTaskDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-200px)]">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onEditTask={handleEditTask}
              onDeleteTask={requestDeleteTask}
            />
          ))}
        </div>
      </DragDropContext>
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setShowAddTaskDialog(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
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
                priority: currentTask.priority || 'medium',
                dueDate: currentTask.dueDate || '',
                status: currentTask.status || 'pending',
              }}
              onSubmit={handleUpdateTask}
              onCancel={() => {
                setShowEditTaskDialog(false);
                setCurrentTask(null);
              }}
            />
          )}
          {currentTask && (
            <Button variant="destructive" className="mt-4 w-full" onClick={() => requestDeleteTask(currentTask.id)}>
              Delete Task
            </Button>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={cancelDeleteTask}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard; 