import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, Star } from 'lucide-react';
import type { Recipe } from '../types/recipe';
import { addFavorite, removeFavorite, isFavorite } from '../services/supabase';
import RecipeModal from './RecipeModal';

interface RecipeDisplayProps {
  recipe: Recipe | null;
  loading: boolean;
}

function RecipeDisplay({ recipe, loading }: RecipeDisplayProps) {
  const [favorite, setFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (recipe) {
      checkFavoriteStatus();
    }
  }, [recipe]);

  const checkFavoriteStatus = async () => {
    if (!recipe) return;
    try {
      const status = await isFavorite(recipe.name);
      setFavorite(status);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recipe || isLoading) return;

    setIsLoading(true);
    try {
      if (favorite) {
        await removeFavorite(recipe.name);
      } else {
        await addFavorite(recipe);
      }
      setFavorite(!favorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 md:h-64 bg-gray-200 rounded-xl"></div>
        <div className="h-6 md:h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-xl"
        onClick={() => setShowModal(true)}
      >
        <div className="relative h-48 md:h-64">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 flex justify-between items-center">
            <h2 className="text-lg md:text-2xl font-bold text-white line-clamp-2">
              {recipe.name}
            </h2>
            <button
              onClick={toggleFavorite}
              disabled={isLoading}
              className={`p-1.5 md:p-2 rounded-full transition-all transform hover:scale-110 ${
                isLoading ? 'opacity-50' : ''
              }`}
            >
              <Star
                className={`w-5 h-5 md:w-6 md:h-6 ${
                  favorite
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          <p className="text-sm md:text-base text-gray-600 line-clamp-2 mb-4">{recipe.description}</p>
          
          <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {recipe.preparationTime}
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {recipe.servings} servings
            </div>
            <div className="flex items-center">
              <ChefHat className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {recipe.difficulty}
            </div>
          </div>

          {recipe.dietaryPreferences && recipe.dietaryPreferences.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {recipe.dietaryPreferences.map((pref) => (
                <span
                  key={pref}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                >
                  {pref}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <RecipeModal
          recipe={recipe}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default RecipeDisplay;