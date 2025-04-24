import React from 'react';
import { Globe2, Plus } from 'lucide-react';
import type { Cuisine } from '../types/recipe';

const cuisines: Cuisine[] = [
  'Italian', 'Indian', 'Japanese', 'Thai', 'Lebanese',
  'Turkish', 'Mexican', 'Korean', 'Ethiopian', 'French',
  'Greek', 'Spanish', 'Vietnamese', 'American', 'Chinese'
];

interface CuisineSelectorProps {
  selected: Cuisine[];
  onChange: (cuisines: Cuisine[]) => void;
}

function CuisineSelector({ selected, onChange }: CuisineSelectorProps) {
  const toggleCuisine = (cuisine: Cuisine) => {
    if (selected.includes(cuisine)) {
      onChange(selected.filter(c => c !== cuisine));
    } else if (selected.length < 2) {
      onChange([...selected, cuisine]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-lg font-medium text-gray-700">
          Choose up to 2 cuisines to fusion (optional)
        </label>
        {selected.length > 0 && (
          <span className="text-sm text-purple-600">
            {selected.length}/2 selected
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => toggleCuisine(cuisine)}
            disabled={selected.length >= 2 && !selected.includes(cuisine)}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-all ${
              selected.includes(cuisine)
                ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                : selected.length >= 2
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Globe2 className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{cuisine}</span>
            {selected.includes(cuisine) && (
              <span className="ml-1 text-xs bg-purple-200 px-1 rounded">
                {selected.indexOf(cuisine) + 1}
              </span>
            )}
          </button>
        ))}
      </div>
      {selected.length === 2 && (
        <div className="flex items-center text-sm text-purple-600">
          <Plus className="w-4 h-4 mr-1" />
          Creating fusion of {selected.join(' & ')}
        </div>
      )}
    </div>
  );
}

export default CuisineSelector;