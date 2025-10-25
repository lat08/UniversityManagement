"use client";

import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  disabled?: boolean;
}

export function ColorPicker({ 
  label, 
  value, 
  onChange, 
  description,
  disabled = false 
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
      {description && (
        <p className="text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}


