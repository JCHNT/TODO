import React, { useState, useEffect } from 'react';
import { Task, ViewMode, TimeView, Theme } from './types';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { triggerConfetti } from './utils/confetti';
import {
  Calendar,
  List,
  Plus,
  Search,
  SunMedium,
  Moon,
  Filter
} from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [timeView, setTimeView] = useState<TimeView>('week');
  const [theme, setTheme] = useState<Theme>('light');
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        deadline: new Date(task.deadline),
        reminder: task.reminder ? new Date(task.reminder) : undefined,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleAddTask = (formData: any) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...formData,
      status: 'todo',
      createdAt: new Date(),
      order: tasks.length,
    };
    setTasks([...tasks, newTask]);
    setShowAddTask(false);
    triggerConfetti();
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const filteredTasks = tasks
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(task => 
      selectedPriority === 'all' || task.priority === selectedPriority
    )
    .sort((a, b) => a.order - b.order);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100`}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-light">Gestionnaire de Tâches</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <SunMedium className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="high">Élevée</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Faible</option>
                </select>
              </div>

              <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>

              {viewMode === 'calendar' && (
                <select
                  value={timeView}
                  onChange={(e) => setTimeView(e.target.value as TimeView)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                >
                  <option value="day">Jour</option>
                  <option value="week">Semaine</option>
                  <option value="month">Mois</option>
                </select>
              )}
            </div>
          </div>
        </header>

        {showAddTask && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-light mb-4">Nouvelle tâche</h2>
            <TaskForm
              onSubmit={handleAddTask}
              onCancel={() => setShowAddTask(false)}
            />
          </div>
        )}

        <main className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <TaskList
            tasks={filteredTasks}
            viewMode={viewMode}
            timeView={timeView}
            onTaskUpdate={handleUpdateTask}
            onTaskDelete={handleDeleteTask}
          />
        </main>
      </div>
    </div>
  );
}

export default App;