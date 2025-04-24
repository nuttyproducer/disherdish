import React from 'react';
import { Palette } from 'lucide-react';

interface AppearanceInputProps {
  value: string;
  onChange: (value: string) => void;
}

function AppearanceInput({ value, onChange }: AppearanceInputProps) {
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-700">
        How should your dish look? (optional)
      </label>
      <div className="relative">
        <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Whimsical and colorful like a fairy tale garden..."
          className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>
      <p className="text-sm text-gray-500 italic">
        This will be used for future AI image generation
      </p>
    </div>
  );
}

export default AppearanceInput