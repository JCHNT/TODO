import React, { useRef, useState } from 'react';
import { Task, Status } from '../types';
import { triggerConfetti } from '../utils/confetti';
import { relativeDate } from '../utils/dates';
import { AlertTriangle, X } from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const COLUMNS: { status: Status; label: string; accent: string; bg: string }[] = [
  {
    status: 'todo',
    label: 'À faire',
    accent: 'border-t-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-800/60',
  },
  {
    status: 'inProgress',
    label: 'En cours',
    accent: 'border-t-amber-400',
    bg: 'bg-amber-50/50 dark:bg-amber-900/10',
  },
  {
    status: 'done',
    label: 'Terminé',
    accent: 'border-t-emerald-400',
    bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
  },
];

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
};

function KanbanCard({
  task,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  const isOverdue = task.status !== 'done' && task.deadline < new Date();
  const doneCount = task.subtasks.filter(s => s.done).length;
  const totalCount = task.subtasks.length;

  return (
    <div
      draggable
      onDragStart={e => {
        e.stopPropagation();
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      className="group bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-sm font-medium leading-snug flex-1 ${
            task.status === 'done'
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {task.title}
        </p>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      {totalCount > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums flex-shrink-0">
            {doneCount}/{totalCount}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 gap-2">
        <div className="flex flex-wrap gap-1 min-w-0">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag.id} className={`text-xs px-1.5 py-0.5 rounded border truncate ${tag.color}`}>
              {tag.name}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">+{task.tags.length - 2}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isOverdue && <AlertTriangle className="w-3 h-3 text-red-400" />}
          <span
            className={`text-xs whitespace-nowrap ${
              isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {relativeDate(task.deadline)}
          </span>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
        </div>
      </div>
    </div>
  );
}

export function KanbanView({ tasks, onTaskUpdate, onTaskDelete }: KanbanViewProps) {
  const draggedId = useRef<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);

  const tasksByStatus: Record<Status, Task[]> = {
    todo: tasks.filter(t => t.status === 'todo').sort((a, b) => a.order - b.order),
    inProgress: tasks.filter(t => t.status === 'inProgress').sort((a, b) => a.order - b.order),
    done: tasks.filter(t => t.status === 'done').sort((a, b) => a.order - b.order),
  };

  const handleDrop = (status: Status) => {
    const id = draggedId.current;
    draggedId.current = null;
    setDragOverStatus(null);
    if (!id) return;
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === status) return;
    onTaskUpdate({
      ...task,
      status,
      completedAt: status === 'done' ? new Date() : undefined,
    });
    if (status === 'done') triggerConfetti();
  };

  const handleDragEnd = () => {
    draggedId.current = null;
    setDragOverStatus(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map(col => {
        const colTasks = tasksByStatus[col.status];
        const isOver = dragOverStatus === col.status;

        return (
          <div
            key={col.status}
            onDragOver={e => {
              e.preventDefault();
              setDragOverStatus(col.status);
            }}
            onDragLeave={e => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverStatus(null);
              }
            }}
            onDrop={() => handleDrop(col.status)}
            className={`rounded-xl border-t-4 ${col.accent} ${col.bg} transition-all duration-150 ${
              isOver ? 'ring-2 ring-blue-300 dark:ring-blue-600 scale-[1.01]' : ''
            }`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {col.label}
              </h3>
              <span className="text-xs font-medium bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 tabular-nums">
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="px-3 pb-3 space-y-2 min-h-[100px]">
              {colTasks.map(task => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onDelete={onTaskDelete}
                  onDragStart={id => {
                    draggedId.current = id;
                  }}
                  onDragEnd={handleDragEnd}
                />
              ))}
              {colTasks.length === 0 && (
                <div
                  className={`flex items-center justify-center h-20 text-xs rounded-lg border-2 border-dashed transition-colors ${
                    isOver
                      ? 'border-blue-300 dark:border-blue-600 text-blue-400 dark:text-blue-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isOver ? 'Relâcher ici' : 'Déposer ici'}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
