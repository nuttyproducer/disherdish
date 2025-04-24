import React, { useEffect, useState } from 'react';
import { getFavorites } from '../services/supabase';
import type { Recipe } from '../types/recipe';
import RecipeDisplay from './RecipeDisplay';

function FavoriteRecipes() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <RecipeDisplay key={i} recipe={null} loading={true} />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No favorite recipes yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {favorites.map((recipe) => (
        <RecipeDisplay
          key={recipe.name}
          recipe={recipe}
          loading={false}
        />
      ))}
    </div>
  );
}

export default FavoriteRecipes;