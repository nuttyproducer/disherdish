import React, { useState } from 'react';
import { X, Clock, Users, ChefHat, Minus, Plus, Star } from 'lucide-react';
import type { Recipe } from '../types/recipe';
import { adjustServings } from '../services/openai';
import { rateRecipe } from '../services/supabase';
import Comments from './Comments';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  const [currentRecipe, setCurrentRecipe] = useState(recipe);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [activeTab, setActiveTab] = useState<'recipe' | 'comments'>('recipe');

  const handleServingChange = async (newServings: number) => {
    if (newServings < 1) return;
    setIsAdjusting(true);
    try {
      const updatedRecipe = await adjustServings(recipe, newServings);
      setCurrentRecipe(updatedRecipe);
    } catch (error) {
      console.error('Error adjusting servings:', error);
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (isRating || !currentRecipe.id) return;
    setIsRating(true);
    try {
      const updatedRecipe = await rateRecipe(currentRecipe.id, rating);
      setCurrentRecipe(updatedRecipe);
    } catch (error) {
      console.error('Error rating recipe:', error);
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 md:p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold line-clamp-1">{currentRecipe.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('recipe')}
              className={`px-4 py-2 -mb-px ${
                activeTab === 'recipe'
                  ? 'border-b-2 border-purple-500 text-purple-700 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Recipe
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 -mb-px ${
                activeTab === 'comments'
                  ? 'border-b-2 border-purple-500 text-purple-700 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Comments
            </button>
          </div>
        </div>
        
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          {activeTab === 'recipe' ? (
            <>
              <div className="aspect-video rounded-xl overflow-hidden">
                <img
                  src={currentRecipe.imageUrl}
                  alt={currentRecipe.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <p className="text-sm md:text-base text-gray-600 italic">{currentRecipe.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {currentRecipe.preparationTime}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleServingChange(currentRecipe.servings - 1)}
                        disabled={currentRecipe.servings <= 1 || isAdjusting}
                        className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span>{currentRecipe.servings} servings</span>
                      <button
                        onClick={() => handleServingChange(currentRecipe.servings + 1)}
                        disabled={isAdjusting}
                        className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ChefHat className="w-4 h-4 mr-1" />
                    {currentRecipe.difficulty}
                  </div>
                </div>

                {currentRecipe.dietaryPreferences && currentRecipe.dietaryPreferences.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentRecipe.dietaryPreferences.map((pref) => (
                      <span
                        key={pref}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Ingredients</h3>
                <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
                  {currentRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-600">{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Instructions</h3>
                <ol className="list-decimal list-inside space-y-3 md:space-y-4 text-sm md:text-base">
                  {currentRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-gray-600">{instruction}</li>
                  ))}
                </ol>
              </div>

              {currentRecipe.flavorSummary && (
                <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
                  <h3 className="text-base md:text-lg font-semibold mb-2">Flavor Profile</h3>
                  <p className="text-sm md:text-base text-gray-600">{currentRecipe.flavorSummary}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm text-gray-600">
                    {currentRecipe.rating ? (
                      <>
                        Rating: {currentRecipe.rating.toFixed(1)} / 5
                        <span className="text-gray-400 ml-2">
                          ({currentRecipe.totalRatings} ratings)
                        </span>
                      </>
                    ) : (
                      'No ratings yet'
                    )}
                  </p>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRating(rating)}
                        onMouseEnter={() => setHoveredRating(rating)}
                        onMouseLeave={() => setHoveredRating(0)}
                        disabled={isRating || !currentRecipe.id}
                        className="p-1 transition-colors disabled:opacity-50"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating <= (hoveredRating || currentRecipe.userRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            currentRecipe.id && <Comments recipeId={currentRecipe.id} />
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;