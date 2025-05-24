import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '@/lib/types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import { getTasks, updateTask } from '@/lib/storage';

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

  useEffect(() => {
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

    loadTasks();
  }, []);

  const onDragEnd = async (result: any) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Find the source and destination columns
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // Create new arrays for source and destination columns
    const sourceTasks = [...sourceColumn.tasks];
    const destTasks = source.droppableId === destination.droppableId 
      ? sourceTasks 
      : [...destColumn.tasks];

    // Remove task from source
    const [movedTask] = sourceTasks.splice(source.index, 1);
    
    // Update task status
    movedTask.status = destination.droppableId as TaskStatus;
    
    // Insert task at destination
    destTasks.splice(destination.index, 0, movedTask);

    // Update columns
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

    // Update task in storage
    try {
      await updateTask(movedTask.id, movedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert changes if update fails
      setColumns(columns);
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <Button className="flex items-center gap-2">
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
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard; 