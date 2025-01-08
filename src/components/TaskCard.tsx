import React, { useState } from 'react';
import { Task } from '../types';
import { Calendar, Clock, Tag as TagIcon, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { TaskForm } from './TaskForm';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors = {
  high: 'border-red-300 bg-red-50/50 dark:bg-red-900/10',
  medium: 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10',
  low: 'border-green-300 bg-green-50/50 dark:bg-green-900/10',
};

const priorityTextColors = {
  high: 'text-red-700 dark:text-red-400',
  medium: 'text-yellow-700 dark:text-yellow-400',
  low: 'text-green-700 dark:text-green-400',
};

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusToggle = () => {
    onUpdate({
      ...task,
      status: task.status === 'done' ? 'todo' : 'done',
      completedAt: task.status === 'done' ? undefined : new Date(),
    });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(task.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <TaskForm
          initialData={{
            title: task.title,
            description: task.description,
            priority: task.priority,
            tags: task.tags.map(t => t.name),
            deadline: task.deadline,
            reminder: task.reminder,
          }}
          onSubmit={(data) => {
            onUpdate({ ...task, ...data });
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 border ${priorityColors[task.priority]} transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={handleStatusToggle}
            className={`mt-1 transition-colors ${task.status === 'done' ? 'text-blue-500' : 'text-slate-300 hover:text-slate-400'}`}
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          <div>
            <h3 className={`text-lg font-medium ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className={`transition-colors ${showDeleteConfirm ? 'text-red-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Échéance: {task.deadline.toLocaleDateString()}</span>
        </div>
        {task.reminder && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>Rappel: {task.reminder.toLocaleDateString()}</span>
          </div>
        )}
        {task.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={`px-2 py-1 text-xs rounded-full ${priorityTextColors[task.priority]} bg-white/50 dark:bg-slate-800/50 border border-current`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}