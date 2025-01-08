import React from 'react';
import { Square, SquareDot } from 'lucide-react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = Math.round((completed / total) * 100);
  const blocks = 5;
  const filledBlocks = Math.round((percentage / 100) * blocks);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: blocks }).map((_, i) => (
          i < filledBlocks ? (
            <SquareDot key={i} className="w-6 h-6 text-blue-600" />
          ) : (
            <Square key={i} className="w-6 h-6 text-gray-300" />
          )
        ))}
      </div>
      <span className="text-sm text-gray-600">{percentage}% completed</span>
    </div>
  );
}