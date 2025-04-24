export type DishType = 'Dessert' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink';
export type RecipeType = 'Original' | 'Existing';
export type DietaryPreference = 
  | 'Vegan' 
  | 'Vegetarian' 
  | 'Gluten-Free' 
  | 'Nut-Free' 
  | 'Dairy-Free' 
  | 'Halal' 
  | 'Kosher'
  | 'Ketogenic'
  | 'High Protein'
  | 'Low Carb'
  | 'Paleo'
  | 'Mediterranean';

export type Cuisine = 
  | 'Italian' | 'Indian' | 'Japanese' | 'Thai' | 'Lebanese' 
  | 'Turkish' | 'Mexican' | 'Korean' | 'Ethiopian' | 'French' 
  | 'Greek' | 'Spanish' | 'Vietnamese' | 'American' | 'Chinese';

export interface Recipe {
  id?: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  preparationTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  cuisine?: string;
  dietaryPreferences?: DietaryPreference[];
  flavorSummary?: string;
  recipeType: RecipeType;
  appearancePrompt?: string;
  rating?: number;
  userRating?: number;
  totalRatings?: number;
  totalComments?: number;
}

export interface Comment {
  id: string;
  userId: string;
  recipeId: string;
  content: string;
  createdAt: string;
  user?: {
    email: string;
  };
}