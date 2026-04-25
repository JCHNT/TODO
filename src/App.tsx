import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Task, ViewMode, TimeView, Theme, SortBy, Priority } from './types';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { ProgressBar } from './components/ProgressBar';
import { namesToTags } from './utils/tags';
import {
  Calendar,
  List,
  Plus,
  Search,
  SunMedium,
  Moon,
  Filter,
  X,
  LayoutGrid,
  Download,
  Upload,
  ArrowUpDown,
} from 'lucide-react';

const TASKS_KEY = 'todo-tasks';
const THEME_KEY = 'todo-theme';

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function parseTasks(raw: string): Task[] {
  try {
    return JSON.parse(raw).map((t: any) => ({
      ...t,
      subtasks: t.subtasks ?? [],
      tags: t.tags ?? [],
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
  const [sortBy, setSortBy] = useState<SortBy>('order');

  const importRef = useRef<HTMLInputElement>(null);

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
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setShowAddTask(v => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddTask = useCallback((formData: any) => {
    setTasks(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...formData,
        tags: namesToTags(formData.tags),
        subtasks: formData.subtasks ?? [],
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

  // ── Export / Import ───────────────────────────────────────────────────────

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taches-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const imported = parseTasks(event.target?.result as string);
        setTasks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const fresh = imported.filter(t => !existingIds.has(t.id));
          return [...prev, ...fresh.map((t, i) => ({ ...t, order: prev.length + i }))];
        });
      } catch {
        alert('Fichier invalide — assurez-vous que c\'est un export JSON valide.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return tasks
      .filter(
        t =>
          q === '' ||
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.name.toLowerCase().includes(q)),
      )
      .filter(t => selectedPriority === 'all' || t.priority === selectedPriority)
      .filter(t => selectedStatus === 'all' || t.status === selectedStatus)
      .sort((a, b) => {
        if (sortBy === 'deadline') return a.deadline.getTime() - b.deadline.getTime();
        if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (sortBy === 'created') return b.createdAt.getTime() - a.createdAt.getTime();
        if (sortBy === 'alpha') return a.title.localeCompare(b.title, 'fr');
        return a.order - b.order;
      });
  }, [tasks, searchQuery, selectedPriority, selectedStatus, sortBy]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      overdue: tasks.filter(t => t.status !== 'done' && t.deadline < now).length,
      inProgress: tasks.filter(t => t.status === 'inProgress').length,
      doneThisWeek: tasks.filter(
        t => t.status === 'done' && t.completedAt != null && t.completedAt >= weekAgo,
      ).length,
      total: tasks.length,
      done: tasks.filter(t => t.status === 'done').length,
    };
  }, [tasks]);

  const hasActiveFilters =
    searchQuery !== '' || selectedPriority !== 'all' || selectedStatus !== 'all';

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedPriority('all');
    setSelectedStatus('all');
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold">Gestionnaire de Tâches</h1>

              {/* Progress + stats */}
              {stats.total > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="w-52">
                    <ProgressBar completed={stats.done} total={stats.total} />
                  </div>
                  <div className="flex gap-3 text-xs">
                    {stats.overdue > 0 && (
                      <span className="text-red-500 dark:text-red-400 font-medium">
                        {stats.overdue} en retard
                      </span>
                    )}
                    {stats.inProgress > 0 && (
                      <span className="text-amber-500 dark:text-amber-400">
                        {stats.inProgress} en cours
                      </span>
                    )}
                    {stats.doneThisWeek > 0 && (
                      <span className="text-emerald-500 dark:text-emerald-400">
                        {stats.doneThisWeek} terminé cette semaine
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {/* Import */}
              <input
                ref={importRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => importRef.current?.click()}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
                title="Importer des tâches (JSON)"
              >
                <Upload className="w-4 h-4" />
              </button>

              {/* Export */}
              {tasks.length > 0 && (
                <button
                  onClick={handleExport}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
                  title="Exporter les tâches (JSON)"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}

              {/* Theme toggle */}
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

              {/* New task (also: press N) */}
              <button
                onClick={() => setShowAddTask(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                title="Nouvelle tâche (N)"
              >
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </button>
            </div>
          </div>

          {/* ── Filter bar ──────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[160px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher… (titre, description, tag)"
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

            {/* Sort */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortBy)}
                className={SELECT}
              >
                <option value="order">Manuel</option>
                <option value="deadline">Échéance</option>
                <option value="priority">Priorité</option>
                <option value="created">Créé le</option>
                <option value="alpha">A → Z</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Effacer
              </button>
            )}

            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 ml-auto">
              {(
                [
                  { mode: 'list' as ViewMode, Icon: List, title: 'Vue liste' },
                  { mode: 'kanban' as ViewMode, Icon: LayoutGrid, title: 'Vue kanban' },
                  { mode: 'calendar' as ViewMode, Icon: Calendar, title: 'Vue calendrier' },
                ] as const
              ).map(({ mode, Icon, title }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={title}
                  className={`p-2 transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
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

        {/* ── Add task form ────────────────────────────────────────────────── */}
        {showAddTask && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">
              Nouvelle tâche{' '}
              <span className="font-normal text-slate-400 dark:text-slate-500">— Esc pour fermer</span>
            </h2>
            <TaskForm onSubmit={handleAddTask} onCancel={() => setShowAddTask(false)} />
          </div>
        )}

        {/* ── Task list ────────────────────────────────────────────────────── */}
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
