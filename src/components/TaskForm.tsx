import React from 'react';
import { Calendar, Clock, Tag as TagIcon, AlertCircle } from 'lucide-react';
import { TaskFormData, Priority } from '../types';

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

export function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = React.useState<TaskFormData>(
    initialData || {
      title: '',
      description: '',
      priority: 'medium',
      tags: [],
      deadline: new Date(),
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Titre
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date d'échéance
            </span>
          </label>
          <input
            type="datetime-local"
            value={formData.deadline.toISOString().slice(0, 16)}
            onChange={(e) => setFormData({ ...formData, deadline: new Date(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Rappel
            </span>
          </label>
          <input
            type="datetime-local"
            value={formData.reminder?.toISOString().slice(0, 16) || ''}
            onChange={(e) => setFormData({ ...formData, reminder: new Date(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Priorité
            </span>
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            <span className="flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Étiquettes
            </span>
          </label>
          <input
            type="text"
            placeholder="Séparer par des virgules"
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}