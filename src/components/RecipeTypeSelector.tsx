import React from 'react';
import { Sparkles, Book } from 'lucide-react';
import type { RecipeType } from '../types/recipe';

interface RecipeTypeSelectorProps {
  selected: RecipeType;
  onChange: (type: RecipeType) => void;
}

function RecipeTypeSelector({ selected, onChange }: RecipeTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-700">
        Recipe Type
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onChange('Original')}
          className={`flex items-center justify-center space-x-2 p-4 rounded-xl transition-all ${
            selected === 'Original'
              ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Original Creation</span>
        </button>
        <button
          onClick={() => onChange('Existing')}
          className={`flex items-center justify-center space-x-2 p-4 rounded-xl transition-all ${
            selected === 'Existing'
              ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Book className="w-5 h-5" />
          <span className="font-medium">Existing Recipe</span>
        </button>
      </div>
    </div>
  );
}

export default RecipeTypeSelector;