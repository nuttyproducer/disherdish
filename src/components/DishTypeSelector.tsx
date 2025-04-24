import React from 'react';
import { ChefHat, Utensils, Coffee, Cookie, GlassWater } from 'lucide-react';

type DishType = 'dessert' | 'lunch' | 'dinner' | 'snack' | 'drink';

interface DishTypeSelectorProps {
  selected: DishType;
  onChange: (type: DishType) => void;
}

const dishTypes = [
  { id: 'dessert', label: 'Dessert', icon: Cookie },
  { id: 'lunch', label: 'Lunch', icon: Utensils },
  { id: 'dinner', label: 'Dinner', icon: ChefHat },
  { id: 'snack', label: 'Snack', icon: Coffee },
  { id: 'drink', label: 'Drink', icon: GlassWater },
] as const;

function DishTypeSelector({ selected, onChange }: DishTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-700">
        What type of dish would you like to generate?
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {dishTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id as DishType)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
              selected === id
                ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DishTypeSelector;