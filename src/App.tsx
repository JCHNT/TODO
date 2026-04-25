import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, ViewMode, TimeView, Theme } from './types';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { ProgressBar } from './components/ProgressBar';
import { namesToTags } from './utils/tags';
import { Calendar, List, Plus, Search, SunMedium, Moon, Filter, X } from 'lucide-react';

const TASKS_KEY = 'todo-tasks';
const THEME_KEY = 'todo-theme';

function parseTasks(raw: string): Task[] {
  try {
    return JSON.parse(raw).map((t: any) => ({
      ...t,
      deadline: new Date(t.deadline),
      reminder: t.reminder ? new Date(t.reminder) : undefined,
      createdAt: new Date(t.createdAt),
      completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

const SELECT =
  'text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-slate-100 transition-shadow';

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(TASKS_KEY);
    return saved ? parseTasks(saved) : [];
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) ?? 'light';
  });

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [timeView, setTimeView] = useState<TimeView>('week');
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddTask(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleAddTask = useCallback((formData: any) => {
    setTasks(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...formData,
        tags: namesToTags(formData.tags),
        status: 'todo' as const,
        createdAt: new Date(),
        order: prev.length,
      },
    ]);
    setShowAddTask(false);
  }, []);

  const handleUpdateTask = useCallback((updated: Task) => {
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const handleReorder = useCallback((draggedId: string, targetId: string) => {
    setTasks(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const fromIdx = sorted.findIndex(t => t.id === draggedId);
      const toIdx = sorted.findIndex(t => t.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const reordered = [...sorted];
      const [item] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, item);
      return reordered.map((t, i) => ({ ...t, order: i }));
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const filteredTasks = useMemo(
    () =>
      tasks
        .filter(
          t =>
            searchQuery === '' ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .filter(t => selectedPriority === 'all' || t.priority === selectedPriority)
        .filter(t => selectedStatus === 'all' || t.status === selectedStatus)
        .sort((a, b) => a.order - b.order),
    [tasks, searchQuery, selectedPriority, selectedStatus],
  );

  const completedCount = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);

  const hasActiveFilters = searchQuery !== '' || selectedPriority !== 'all' || selectedStatus !== 'all';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">

        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold">Gestionnaire de Tâches</h1>
              {tasks.length > 0 && (
                <div className="mt-2 w-52">
                  <ProgressBar completed={completedCount} total={tasks.length} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <SunMedium className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowAddTask(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </button>
            </div>
          </div>

          {/* Filters bar */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[160px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-slate-100 dark:placeholder:text-slate-400 transition-shadow"
              />
            </div>

            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />

            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className={SELECT}
            >
              <option value="all">Priorité</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className={SELECT}
            >
              <option value="all">Statut</option>
              <option value="todo">À faire</option>
              <option value="inProgress">En cours</option>
              <option value="done">Terminé</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPriority('all');
                  setSelectedStatus('all');
                }}
                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Réinitialiser les filtres"
              >
                <X className="w-3.5 h-3.5" />
                Effacer
              </button>
            )}

            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 ml-auto">
              <button
                onClick={() => setViewMode('list')}
                title="Vue liste"
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                title="Vue calendrier"
                className={`p-2 transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {viewMode === 'calendar' && (
              <select
                value={timeView}
                onChange={e => setTimeView(e.target.value as TimeView)}
                className={SELECT}
              >
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
            )}
          </div>
        </header>

        {/* Add task form */}
        {showAddTask && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">
              Nouvelle tâche
            </h2>
            <TaskForm onSubmit={handleAddTask} onCancel={() => setShowAddTask(false)} />
          </div>
        )}

        {/* Task list */}
        <main className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-5">
          <TaskList
            tasks={filteredTasks}
            viewMode={viewMode}
            timeView={timeView}
            onTaskUpdate={handleUpdateTask}
            onTaskDelete={handleDeleteTask}
            onTaskReorder={handleReorder}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
