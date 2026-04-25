import React, { useState, useCallback } from 'react';
import { Task } from '../types';
import {
  Calendar,
  Clock,
  Tag as TagIcon,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { TaskForm } from './TaskForm';
import { triggerConfetti } from '../utils/confetti';
import { namesToTags } from '../utils/tags';
import { relativeDate } from '../utils/dates';

const PRIORITY_BORDER: Record<string, string> = {
  high: 'border-l-red-400',
  medium: 'border-l-amber-400',
  low: 'border-l-emerald-400',
};

const PRIORITY_BADGE: Record<string, string> = {
  high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  low: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
};

const PRIORITY_LABEL: Record<string, string> = {
  high: 'Élevée',
  medium: 'Moyenne',
  low: 'Faible',
};

const STATUS_CYCLE: Record<Task['status'], Task['status']> = {
  todo: 'inProgress',
  inProgress: 'done',
  done: 'todo',
};

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);

  const isOverdue = task.status !== 'done' && task.deadline < new Date();
  const doneSubtasks = task.subtasks.filter(s => s.done).length;
  const totalSubtasks = task.subtasks.length;

  const handleStatusCycle = useCallback(() => {
    const next = STATUS_CYCLE[task.status];
    onUpdate({
      ...task,
      status: next,
      completedAt: next === 'done' ? new Date() : undefined,
    });
    if (next === 'done') triggerConfetti();
  }, [task, onUpdate]);

  const handleToggleSubtask = useCallback(
    (subtaskId: string) => {
      onUpdate({
        ...task,
        subtasks: task.subtasks.map(s =>
          s.id === subtaskId ? { ...s, done: !s.done } : s,
        ),
      });
    },
    [task, onUpdate],
  );

  const handleDelete = useCallback(() => {
    if (pendingDelete) {
      onDelete(task.id);
    } else {
      setPendingDelete(true);
      setTimeout(() => setPendingDelete(false), 2000);
    }
  }, [pendingDelete, task.id, onDelete]);

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
        <TaskForm
          initialData={{
            title: task.title,
            description: task.description,
            priority: task.priority,
            tags: task.tags.map(t => t.name),
            subtasks: task.subtasks,
            deadline: task.deadline,
            reminder: task.reminder,
          }}
          onSubmit={data => {
            onUpdate({ ...task, ...data, tags: namesToTags(data.tags) });
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  const StatusIcon =
    task.status === 'done' ? CheckCircle2 : task.status === 'inProgress' ? Timer : Circle;

  const statusTitle =
    task.status === 'todo'
      ? 'Marquer en cours'
      : task.status === 'inProgress'
        ? 'Marquer terminé'
        : 'Remettre à faire';

  return (
    <div
      className={`group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 ${PRIORITY_BORDER[task.priority]} p-4 transition-all duration-200 ${
        isOverdue ? 'ring-1 ring-red-300 dark:ring-red-800/60' : ''
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={handleStatusCycle}
            title={statusTitle}
            className={`mt-0.5 flex-shrink-0 transition-colors ${
              task.status === 'done'
                ? 'text-blue-500'
                : task.status === 'inProgress'
                  ? 'text-amber-500'
                  : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-400'
            }`}
          >
            <StatusIcon className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-sm font-medium leading-snug ${
                  task.status === 'done'
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {task.title}
              </h3>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_BADGE[task.priority]}`}>
                {PRIORITY_LABEL[task.priority]}
              </span>
              {isOverdue && (
                <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  En retard
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            title={pendingDelete ? 'Cliquer pour confirmer' : 'Supprimer'}
            className={`p-1.5 rounded-lg transition-colors ${
              pendingDelete
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtasks */}
      {totalSubtasks > 0 && (
        <div className="mt-3 pl-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${(doneSubtasks / totalSubtasks) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
              {doneSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="space-y-1.5">
            {task.subtasks.map(subtask => (
              <button
                key={subtask.id}
                onClick={() => handleToggleSubtask(subtask.id)}
                className="flex items-center gap-2 w-full text-left group/sub"
              >
                {subtask.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover/sub:text-slate-400 flex-shrink-0 transition-colors" />
                )}
                <span
                  className={`text-xs ${
                    subtask.done
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {subtask.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span
          className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500 dark:text-red-400' : ''}`}
          title={task.deadline.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        >
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          {relativeDate(task.deadline)}
        </span>

        {task.reminder && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            {relativeDate(task.reminder)}
          </span>
        )}

        {task.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <TagIcon className="w-3.5 h-3.5" />
            {task.tags.map(tag => (
              <span key={tag.id} className={`px-2 py-0.5 rounded-full border text-xs ${tag.color}`}>
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
