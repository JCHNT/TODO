import React, { useState } from 'react';
import { Task, TimeView } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  timeView: TimeView;
  onTaskUpdate: (task: Task) => void;
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
};

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function tasksOnDay(tasks: Task[], day: Date): Task[] {
  return tasks.filter(t => isSameDay(t.deadline, day));
}

function TaskPill({ task }: { task: Task }) {
  return (
    <div
      className={`flex items-center gap-1 text-xs rounded px-1 py-0.5 truncate ${
        task.status === 'done'
          ? 'line-through text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50'
          : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 shadow-sm'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
      <span className="truncate">{task.title}</span>
    </div>
  );
}

function NavBar({
  label,
  onPrev,
  onNext,
  onToday,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrev}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">
          {label}
        </h3>
        <button
          onClick={onToday}
          className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Aujourd'hui
        </button>
      </div>
      <button
        onClick={onNext}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export function CalendarView({ tasks, timeView }: CalendarViewProps) {
  const [current, setCurrent] = useState(() => startOfDay(new Date()));
  const today = startOfDay(new Date());

  const navigate = (dir: number) => {
    setCurrent(prev => {
      const d = new Date(prev);
      if (timeView === 'month') d.setMonth(d.getMonth() + dir);
      else if (timeView === 'week') d.setDate(d.getDate() + dir * 7);
      else d.setDate(d.getDate() + dir);
      return d;
    });
  };

  const goToday = () => setCurrent(startOfDay(new Date()));

  // ── Day view ──────────────────────────────────────────────────────────────
  if (timeView === 'day') {
    const dayTasks = tasksOnDay(tasks, current);
    const label = current.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return (
      <div>
        <NavBar label={label} onPrev={() => navigate(-1)} onNext={() => navigate(1)} onToday={goToday} />
        {dayTasks.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-12">
            Aucune tâche ce jour
          </p>
        ) : (
          <div className="space-y-2">
            {dayTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  task.status === 'done'
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                <span
                  className={`flex-1 text-sm ${
                    task.status === 'done'
                      ? 'line-through text-slate-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {task.title}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                  {task.deadline.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Week view ─────────────────────────────────────────────────────────────
  if (timeView === 'week') {
    const monday = new Date(current);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    const label = `Semaine du ${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;

    return (
      <div>
        <NavBar label={label} onPrev={() => navigate(-1)} onNext={() => navigate(1)} onToday={goToday} />
        <div className="grid grid-cols-7 gap-2">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 pb-2">
              {d}
            </div>
          ))}
          {days.map(day => {
            const dayTasks = tasksOnDay(tasks, day);
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[90px] rounded-lg p-2 border ${
                  isToday
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50'
                }`}
              >
                <div
                  className={`text-xs font-semibold mb-1.5 ${
                    isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <TaskPill key={task.id} task={task} />
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      +{dayTasks.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Month view ────────────────────────────────────────────────────────────
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startPad + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null;
    return new Date(year, month, dayNum);
  });

  const label = current.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <NavBar label={label} onPrev={() => navigate(-1)} onNext={() => navigate(1)} onToday={goToday} />
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const dayTasks = tasksOnDay(tasks, day);
          const isToday = isSameDay(day, today);
          const isCurrentMonth = day.getMonth() === month;

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[72px] rounded-lg p-1.5 transition-colors ${
                isToday
                  ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300 dark:ring-blue-700'
                  : isCurrentMonth
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    : 'opacity-40'
              }`}
            >
              <div
                className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                  isToday
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {day.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 2).map(task => (
                  <TaskPill key={task.id} task={task} />
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 pl-1">
                    +{dayTasks.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
