import type { Recipe, GenerateRecipeParams } from '../types/recipe';
import { supabase } from './supabase';

export async function generateRecipe(params: GenerateRecipeParams): Promise<Recipe[]> {
  try {
    // Get the current session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate recipes');
    }

    const recipes = await response.json();
    return recipes;
  } catch (error) {
    console.error('Error generating recipes:', error);
    throw error instanceof Error ? error : new Error('Failed to generate recipes');
  }
}

export async function adjustServings(recipe: Recipe, newServings: number): Promise<Recipe> {
  const ratio = newServings / recipe.servings;
  return {
    ...recipe,
    ingredients: recipe.ingredients.map(ingredient => {
      return ingredient.replace(/\d+(\.\d+)?/g, (match) => {
        const num = parseFloat(match);
        return (num * ratio).toFixed(2);
      });
    }),
    servings: newServings
  };
}