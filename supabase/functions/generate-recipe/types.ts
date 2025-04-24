export interface GenerateRecipeParams {
  recipeType: string;
  dishType: string;
  cuisines?: string[];
  dietaryPreferences?: string[];
  ingredient?: string;
  appearancePrompt?: string;
}

export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  preparationTime: string;
  difficulty: string;
  servings: number;
  cuisine: string;
  dietaryPreferences: string[];
  flavorSummary: string;
  recipeType: string;
  appearancePrompt?: string;
  dishType: string;
}