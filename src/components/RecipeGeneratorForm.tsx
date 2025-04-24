import React, { useState } from 'react';
import { Globe2, Plus, Leaf, Wheat, Nut, Milk, Star, Moon, Palette } from 'lucide-react';
import type { DishType, RecipeType, Cuisine, DietaryPreference } from '../types/recipe';

const CUISINES: Cuisine[] = [
  'Italian', 'Indian', 'Japanese', 'Thai', 'Lebanese',
  'Turkish', 'Mexican', 'Korean', 'Ethiopian', 'French',
  'Greek', 'Spanish', 'Vietnamese', 'American', 'Chinese'
];

const DIETARY_OPTIONS: DietaryPreference[] = [
  'Vegan', 'Vegetarian', 'Gluten-Free', 'Nut-Free', 'Dairy-Free', 'Halal', 'Kosher'
];

interface FormData {
  recipeType: RecipeType;
  dishType: DishType;
  cuisines: Cuisine[];
  dietaryPreferences: DietaryPreference[];
  ingredient: string;
  appearancePrompt: string;
}

interface RecipeGeneratorFormProps {
  onGenerate: (data: FormData) => void;
}

export default function RecipeGeneratorForm({ onGenerate }: RecipeGeneratorFormProps) {
  const [form, setForm] = useState<FormData>({
    recipeType: 'Original',
    dishType: 'Dessert',
    cuisines: [],
    dietaryPreferences: [],
    ingredient: '',
    appearancePrompt: ''
  });

  const handleChange = (key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleMulti = (key: 'cuisines' | 'dietaryPreferences', value: Cuisine | DietaryPreference) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : prev[key].length < (key === 'cuisines' ? 2 : prev[key].length + 1)
          ? [...prev[key], value]
          : prev[key]
    }));
  };

  const handleSubmit = () => {
    onGenerate(form);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
      {/* Recipe Type Selection */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">
          Recipe Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          {['Original', 'Existing'].map(type => (
            <button
              key={type}
              onClick={() => handleChange('recipeType', type)}
              className={`flex items-center justify-center space-x-2 p-4 rounded-xl transition-all ${
                form.recipeType === type
                  ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="font-medium">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dish Type Selection */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">
          What type of dish would you like to generate?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {["Dessert", "Lunch", "Dinner", "Snack", "Drink"].map(type => (
            <button
              key={type}
              onClick={() => handleChange('dishType', type)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                form.dishType === type
                  ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="font-medium">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cuisine Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-lg font-medium text-gray-700">
            Choose up to 2 cuisines to fusion (optional)
          </label>
          {form.cuisines.length > 0 && (
            <span className="text-sm text-purple-600">
              {form.cuisines.length}/2 selected
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {CUISINES.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => toggleMulti('cuisines', cuisine)}
              disabled={form.cuisines.length >= 2 && !form.cuisines.includes(cuisine)}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-all ${
                form.cuisines.includes(cuisine)
                  ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                  : form.cuisines.length >= 2
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe2 className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{cuisine}</span>
              {form.cuisines.includes(cuisine) && (
                <span className="ml-1 text-xs bg-purple-200 px-1 rounded">
                  {form.cuisines.indexOf(cuisine) + 1}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">
          Dietary Preferences (optional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {DIETARY_OPTIONS.map(pref => (
            <button
              key={pref}
              onClick={() => toggleMulti('dietaryPreferences', pref)}
              className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                form.dietaryPreferences.includes(pref)
                  ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pref === 'Vegan' && <Leaf className="w-5 h-5" />}
              {pref === 'Vegetarian' && <Leaf className="w-5 h-5" />}
              {pref === 'Gluten-Free' && <Wheat className="w-5 h-5" />}
              {pref === 'Nut-Free' && <Nut className="w-5 h-5" />}
              {pref === 'Dairy-Free' && <Milk className="w-5 h-5" />}
              {pref === 'Halal' && <Star className="w-5 h-5" />}
              {pref === 'Kosher' && <Moon className="w-5 h-5" />}
              <span className="text-sm font-medium">{pref}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient Input */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">
          Want to include a specific ingredient?
        </label>
        <input
          type="text"
          value={form.ingredient}
          onChange={(e) => handleChange('ingredient', e.target.value)}
          placeholder="e.g., strawberry, cardamom, chocolate..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Appearance Input */}
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-700">
          How should your dish look? (optional)
        </label>
        <div className="relative">
          <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={form.appearancePrompt}
            onChange={(e) => handleChange('appearancePrompt', e.target.value)}
            placeholder="e.g., Whimsical and colorful like a fairy tale garden..."
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <p className="text-sm text-gray-500 italic">
          This will be used for future AI image generation
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 font-medium"
      >
        <span>Generate Magical Recipe</span>
      </button>
    </div>
  );
}