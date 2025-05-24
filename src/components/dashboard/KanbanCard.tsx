import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Task } from '@/lib/types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Tag } from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  index: number;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, index }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'low':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 p-4 ${
            snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
          } hover:shadow-md transition-shadow bg-opacity-90 backdrop-blur-sm`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">{task.title}</h4>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {task.description}
          </p>
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{task.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          </div>
        </Card>
      )}
    </Draggable>
  );
};

export default KanbanCard; 