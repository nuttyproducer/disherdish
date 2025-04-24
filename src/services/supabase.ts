import { createClient } from '@supabase/supabase-js';
import type { Recipe } from '../types/recipe';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getFavorites(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('recipe')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data?.map(row => row.recipe as Recipe) || [];
}

export async function addFavorite(recipe: Recipe): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert([{ recipe }]);

  if (error) throw error;
}

export async function removeFavorite(recipeName: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('recipe->>name', recipeName);

  if (error) throw error;
}

export async function isFavorite(recipeName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('recipe->>name', recipeName)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function rateRecipe(recipeId: string, rating: number): Promise<Recipe> {
  const { data: existingRating, error: checkError } = await supabase
    .from('user_ratings')
    .select('id')
    .eq('recipe_id', recipeId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') throw checkError;

  const { error: ratingError } = existingRating
    ? await supabase
        .from('user_ratings')
        .update({ rating })
        .eq('id', existingRating.id)
    : await supabase
        .from('user_ratings')
        .insert([{ recipe_id: recipeId, rating }]);

  if (ratingError) throw ratingError;

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();

  if (recipeError) throw recipeError;

  return {
    ...recipe,
    userRating: rating,
  } as Recipe;
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('Must be logged in to save recipes');
  }

  const { error } = await supabase
    .from('recipes')
    .insert([{
      user_id: user.user.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image_url: recipe.imageUrl,
      preparation_time: recipe.preparationTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      cuisine: recipe.cuisine,
      dietary_preferences: recipe.dietaryPreferences,
      flavor_summary: recipe.flavorSummary,
      recipe_type: recipe.recipeType,
      appearance_prompt: recipe.appearancePrompt,
      dish_type: recipe.dishType
    }]);

  if (error) throw error;
}

interface RecipeFilters {
  search?: string;
  dishTypes?: string[];
  cuisines?: string[];
  dietaryPreferences?: string[];
  recipeType?: string;
  sortBy?: 'latest' | 'popular' | 'rating';
}

export async function getRecipes(filters: RecipeFilters = {}) {
  let query = supabase
    .from('recipes')
    .select('*');

  // Full-text search on name and description
  if (filters.search) {
    query = query.textSearch('fts', filters.search);
  }

  // Filter by dish types
  if (filters.dishTypes?.length) {
    query = query.in('dish_type', filters.dishTypes);
  }

  // Filter by cuisines
  if (filters.cuisines?.length) {
    query = query.in('cuisine', filters.cuisines);
  }

  // Filter by dietary preferences using contains for array matching
  if (filters.dietaryPreferences?.length === 1) {
    query = query.contains('dietary_preferences', filters.dietaryPreferences);
  }

  // Filter by recipe type
  if (filters.recipeType) {
    query = query.eq('recipe_type', filters.recipeType);
  }

  // Apply sorting
  switch (filters.sortBy) {
    case 'popular':
      query = query.order('view_count', { ascending: false });
      break;
    case 'rating':
      query = query.order('average_rating', { ascending: false, nullsLast: true });
      break;
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data?.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    ingredients: row.ingredients,
    instructions: row.instructions,
    imageUrl: row.image_url,
    preparationTime: row.preparation_time,
    difficulty: row.difficulty,
    servings: row.servings,
    cuisine: row.cuisine,
    dietaryPreferences: row.dietary_preferences,
    flavorSummary: row.flavor_summary,
    recipeType: row.recipe_type,
    appearancePrompt: row.appearance_prompt,
    dishType: row.dish_type,
    rating: row.average_rating,
    totalRatings: row.total_ratings
  } as Recipe)) || [];
}

export async function incrementViewCount(recipeId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_recipe_view_count', {
    recipe_id: recipeId
  });

  if (error) throw error;
}