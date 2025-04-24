import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import type { Recipe, DishType, Cuisine, DietaryPreference, RecipeType } from '../types/recipe';
import { getRecipes } from '../services/supabase';
import RecipeDisplay from './RecipeDisplay';

interface Filters {
  dishType?: DishType;
  cuisine?: Cuisine;
  dietaryPreferences?: DietaryPreference[];
  recipeType?: RecipeType;
  searchTerm?: string;
}

const dietaryOptions: DietaryPreference[] = [
  'Vegan', 'Vegetarian', 'Gluten-Free', 'Nut-Free', 'Dairy-Free', 
  'Halal', 'Kosher', 'Ketogenic', 'High Protein', 'Low Carb',
  'Paleo', 'Mediterranean'
];

function RecipeDatabase() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, [filters]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await getRecipes(filters);
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDietaryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DietaryPreference;
    setFilters(prev => ({
      ...prev,
      dietaryPreferences: value ? [value] : undefined
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Recipe Database</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <select
            className="rounded-lg border border-gray-300 p-2"
            onChange={(e) => setFilters({ ...filters, dishType: e.target.value as DishType })}
            value={filters.dishType || ''}
          >
            <option value="">All Dish Types</option>
            <option value="Dessert">Dessert</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
            <option value="Drink">Drink</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 p-2"
            onChange={(e) => setFilters({ ...filters, cuisine: e.target.value as Cuisine })}
            value={filters.cuisine || ''}
          >
            <option value="">All Cuisines</option>
            <option value="Italian">Italian</option>
            <option value="Indian">Indian</option>
            <option value="Japanese">Japanese</option>
            <option value="Thai">Thai</option>
            <option value="Lebanese">Lebanese</option>
            <option value="Turkish">Turkish</option>
            <option value="Mexican">Mexican</option>
            <option value="Korean">Korean</option>
            <option value="Ethiopian">Ethiopian</option>
            <option value="French">French</option>
            <option value="Greek">Greek</option>
            <option value="Spanish">Spanish</option>
            <option value="Vietnamese">Vietnamese</option>
            <option value="American">American</option>
            <option value="Chinese">Chinese</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 p-2"
            onChange={(e) => setFilters({ ...filters, recipeType: e.target.value as RecipeType })}
            value={filters.recipeType || ''}
          >
            <option value="">All Recipe Types</option>
            <option value="Original">Original</option>
            <option value="Existing">Existing</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 p-2"
            onChange={handleDietaryChange}
            value={filters.dietaryPreferences?.[0] || ''}
          >
            <option value="">All Dietary Options</option>
            {dietaryOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <button
            onClick={() => setFilters({})}
            className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 hover:bg-gray-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(null).map((_, i) => (
            <RecipeDisplay key={i} recipe={null} loading={true} />
          ))
        ) : recipes.length > 0 ? (
          recipes.map((recipe) => (
            <RecipeDisplay
              key={recipe.name}
              recipe={recipe}
              loading={false}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No recipes found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDatabase;