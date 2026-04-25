import React from 'react';
import { Calendar, Clock, Tag as TagIcon, AlertCircle, Plus, X, ListChecks } from 'lucide-react';
import { TaskFormData, Priority, Subtask } from '../types';

const INPUT =
  'w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm';

function toLocalDatetime(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

export function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = React.useState<TaskFormData>(
    initialData ?? {
      title: '',
      description: '',
      priority: 'medium',
      tags: [],
      subtasks: [],
      deadline: new Date(),
    },
  );

  const set = (patch: Partial<TaskFormData>) => setFormData(prev => ({ ...prev, ...patch }));

  const addSubtask = () => {
    set({
      subtasks: [
        ...formData.subtasks,
        { id: crypto.randomUUID(), title: '', done: false },
      ],
    });
  };

  const updateSubtask = (id: string, title: string) => {
    set({ subtasks: formData.subtasks.map(s => (s.id === id ? { ...s, title } : s)) });
  };

  const removeSubtask = (id: string) => {
    set({ subtasks: formData.subtasks.filter(s => s.id !== id) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit({
      ...formData,
      title: formData.title.trim(),
      subtasks: formData.subtasks.filter(s => s.title.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
          Titre
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => set({ title: e.target.value })}
          className={INPUT}
          placeholder="Nom de la tâche…"
          autoFocus
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          value={formData.description ?? ''}
          onChange={e => set({ description: e.target.value })}
          className={INPUT}
          rows={2}
          placeholder="Détails optionnels…"
        />
      </div>

      {/* Deadline + Reminder */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5" /> Échéance
          </label>
          <input
            type="datetime-local"
            value={toLocalDatetime(formData.deadline)}
            onChange={e => set({ deadline: new Date(e.target.value) })}
            className={INPUT}
            required
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5" /> Rappel
          </label>
          <input
            type="datetime-local"
            value={formData.reminder ? toLocalDatetime(formData.reminder) : ''}
            onChange={e => set({ reminder: e.target.value ? new Date(e.target.value) : undefined })}
            className={INPUT}
          />
        </div>
      </div>

      {/* Priority + Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            <AlertCircle className="w-3.5 h-3.5" /> Priorité
          </label>
          <select
            value={formData.priority}
            onChange={e => set({ priority: e.target.value as Priority })}
            className={INPUT}
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            <TagIcon className="w-3.5 h-3.5" /> Étiquettes
          </label>
          <input
            type="text"
            placeholder="travail, urgent…"
            value={formData.tags.join(', ')}
            onChange={e =>
              set({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })
            }
            className={INPUT}
          />
        </div>
      </div>

      {/* Subtasks */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          <ListChecks className="w-3.5 h-3.5" /> Sous-tâches
        </label>
        <div className="space-y-2">
          {formData.subtasks.map(subtask => (
            <div key={subtask.id} className="flex items-center gap-2">
              <input
                type="text"
                value={subtask.title}
                onChange={e => updateSubtask(subtask.id, e.target.value)}
                placeholder="Intitulé de la sous-tâche…"
                className={INPUT + ' flex-1'}
              />
              <button
                type="button"
                onClick={() => removeSubtask(subtask.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSubtask}
            className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une sous-tâche
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}
