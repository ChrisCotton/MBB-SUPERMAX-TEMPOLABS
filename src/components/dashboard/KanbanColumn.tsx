import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '@/lib/types';
import { Card } from '../ui/card';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  column: {
    id: TaskStatus;
    title: string;
    tasks: Task[];
  };
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onEditTask, onDeleteTask }) => {
  return (
    <Card className="flex flex-col h-full bg-opacity-50 backdrop-blur-sm">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">{column.title}</h3>
        <span className="text-sm text-gray-500">{column.tasks.length} tasks</span>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-4 overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-gray-100/10' : ''
            }`}
          >
            {column.tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} index={index} onEdit={onEditTask} onDelete={onDeleteTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );
};

export default KanbanColumn; 