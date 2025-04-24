import React from 'react';
import { Leaf, Wheat, Nut, Milk, Star, Moon, Flame, Dumbbell, Cookie, Beef, Fish } from 'lucide-react';
import type { DietaryPreference } from '../types/recipe';

const preferences: Array<{
  id: DietaryPreference;
  label: string;
  icon: React.ElementType;
}> = [
  { id: 'Vegan', label: 'Vegan', icon: Leaf },
  { id: 'Vegetarian', label: 'Vegetarian', icon: Leaf },
  { id: 'Gluten-Free', label: 'Gluten-Free', icon: Wheat },
  { id: 'Nut-Free', label: 'Nut-Free', icon: Nut },
  { id: 'Dairy-Free', label: 'Dairy-Free', icon: Milk },
  { id: 'Halal', label: 'Halal', icon: Star },
  { id: 'Kosher', label: 'Kosher', icon: Moon },
  { id: 'Ketogenic', label: 'Ketogenic', icon: Flame },
  { id: 'High Protein', label: 'High Protein', icon: Dumbbell },
  { id: 'Low Carb', label: 'Low Carb', icon: Cookie },
  { id: 'Paleo', label: 'Paleo', icon: Beef },
  { id: 'Mediterranean', label: 'Mediterranean', icon: Fish },
];

interface DietaryPreferencesProps {
  selected: DietaryPreference[];
  onChange: (preferences: DietaryPreference[]) => void;
}

function DietaryPreferences({ selected, onChange }: DietaryPreferencesProps) {
  const togglePreference = (preference: DietaryPreference) => {
    if (selected.includes(preference)) {
      onChange(selected.filter(p => p !== preference));
    } else {
      onChange([...selected, preference]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-700">
        Dietary Preferences (optional)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {preferences.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => togglePreference(id)}
            className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
              selected.includes(id)
                ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DietaryPreferences;