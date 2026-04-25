import React, { useRef } from 'react';
import { Task, ViewMode, TimeView } from '../types';
import { TaskCard } from './TaskCard';
import { CalendarView } from './CalendarView';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  viewMode: ViewMode;
  timeView: TimeView;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskReorder: (draggedId: string, targetId: string) => void;
}

export function TaskList({
  tasks,
  viewMode,
  timeView,
  onTaskUpdate,
  onTaskDelete,
  onTaskReorder,
}: TaskListProps) {
  const draggedId = useRef<string | null>(null);

  if (viewMode === 'calendar') {
    return <CalendarView tasks={tasks} timeView={timeView} onTaskUpdate={onTaskUpdate} />;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
        <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">Aucune tâche trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div
          key={task.id}
          draggable
          onDragStart={() => {
            draggedId.current = task.id;
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={() => {
            if (draggedId.current && draggedId.current !== task.id) {
              onTaskReorder(draggedId.current, task.id);
              draggedId.current = null;
            }
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          <TaskCard task={task} onUpdate={onTaskUpdate} onDelete={onTaskDelete} />
        </div>
      ))}
    </div>
  );
}
