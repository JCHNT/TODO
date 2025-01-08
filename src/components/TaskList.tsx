import React from 'react';
import { Task, ViewMode, TimeView } from '../types';
import { TaskCard } from './TaskCard';
import { Calendar, List } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  viewMode: ViewMode;
  timeView: TimeView;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TaskList({
  tasks,
  viewMode,
  timeView,
  onTaskUpdate,
  onTaskDelete
}: TaskListProps) {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData('taskId');
    if (draggedTaskId === targetTaskId) return;

    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    const targetTask = tasks.find(t => t.id === targetTaskId);
    if (!draggedTask || !targetTask) return;

    const newOrder = targetTask.order;
    onTaskUpdate({ ...draggedTask, order: newOrder });
  };

  if (viewMode === 'calendar') {
    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Calendar view implementation */}
        {/* This would show tasks organized by date */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(e, task.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, task.id)}
        >
          <TaskCard
            task={task}
            onUpdate={onTaskUpdate}
            onDelete={onTaskDelete}
          />
        </div>
      ))}
    </div>
  );
}