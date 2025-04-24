import React, { useState, useEffect } from 'react';
import { Star, UserCircle } from 'lucide-react';
import { supabase } from './services/supabase';
import Auth from './components/Auth';
import Profile from './components/Profile';
import DishTypeSelector from './components/DishTypeSelector';
import CuisineSelector from './components/CuisineSelector';
import DietaryPreferences from './components/DietaryPreferences';
import RecipeTypeSelector from './components/RecipeTypeSelector';
import IngredientInput from './components/IngredientInput';
import AppearanceInput from './components/AppearanceInput';
import GenerateButton from './components/GenerateButton';
import RecipeDisplay from './components/RecipeDisplay';
import FavoriteRecipes from './components/FavoriteRecipes';
import RecipeDatabase from './components/RecipeDatabase';
import { generateRecipe } from './services/openai';
import type { Recipe, DishType, Cuisine, DietaryPreference, RecipeType } from './types/recipe';

function App() {
  const [session, setSession] = useState(null);
  const [selectedDishType, setSelectedDishType] = useState<DishType>('Dessert');
  const [selectedCuisines, setSelectedCuisines] = useState<Cuisine[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<DietaryPreference[]>([]);
  const [recipeType, setRecipeType] = useState<RecipeType>('Original');
  const [ingredient, setIngredient] = useState('');
  const [appearancePrompt, setAppearancePrompt] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGenerate = async () => {
    setError(null);
    try {
      setLoading(true);
      const newRecipes = await generateRecipe({
        dishType: selectedDishType,
        cuisine: selectedCuisines.length > 0 ? selectedCuisines.join(' & ') as Cuisine : undefined,
        ingredient,
        dietaryPreferences: selectedDietary,
        recipeType,
        appearancePrompt
      });
      setRecipes(newRecipes);
      setShowFavorites(false);
      setShowDatabase(false);
      setShowProfile(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Fantasy Food Generator
            </h1>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <button
                onClick={() => {
                  setShowFavorites(false);
                  setShowDatabase(false);
                  setShowProfile(!showProfile);
                }}
                className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all text-sm md:text-base"
              >
                <UserCircle className={showProfile ? "text-purple-600" : ""} />
                <span>{showProfile ? "Back to Generator" : "Profile"}</span>
              </button>
              <button
                onClick={() => {
                  setShowFavorites(false);
                  setShowProfile(false);
                  setShowDatabase(!showDatabase);
                }}
                className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all text-sm md:text-base"
              >
                <span>{showDatabase ? "Back to Generator" : "Recipe Database"}</span>
              </button>
              <button
                onClick={() => {
                  setShowDatabase(false);
                  setShowProfile(false);
                  setShowFavorites(!showFavorites);
                }}
                className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all text-sm md:text-base"
              >
                <Star className={showFavorites ? "fill-yellow-400 text-yellow-400" : ""} />
                <span>{showFavorites ? "Back to Generator" : "My Favorites"}</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all text-sm md:text-base"
              >
                Sign Out
              </button>
            </div>
          </div>

          {showProfile ? (
            <Profile />
          ) : !showFavorites && !showDatabase ? (
            <>
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 space-y-6 md:space-y-8 mb-6 md:mb-8">
                <RecipeTypeSelector
                  selected={recipeType}
                  onChange={setRecipeType}
                />
                <DishTypeSelector
                  selected={selectedDishType}
                  onChange={setSelectedDishType}
                />
                <CuisineSelector
                  selected={selectedCuisines}
                  onChange={setSelectedCuisines}
                />
                <DietaryPreferences
                  selected={selectedDietary}
                  onChange={setSelectedDietary}
                />
                <IngredientInput
                  value={ingredient}
                  onChange={setIngredient}
                />
                <AppearanceInput
                  value={appearancePrompt}
                  onChange={setAppearancePrompt}
                />
                <GenerateButton onClick={handleGenerate} />
                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm md:text-base">
                    {error}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {loading ? (
                  [1, 2, 3].map((i) => (
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
                ) : null}
              </div>
            </>
          ) : showDatabase ? (
            <RecipeDatabase />
          ) : (
            <FavoriteRecipes />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;