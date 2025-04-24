import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { GenerateRecipeParams, Recipe } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DEEPSEEK_API_KEY = 'sk-f80025d218bf41bd900375a30fe5a303';

async function getUserProfile(userId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return profile;
}

function buildDeepSeekPrompt(params: GenerateRecipeParams, profile: any): string {
  const allergies = [...(profile.allergies || [])];
  if (profile.custom_allergies) {
    allergies.push(...profile.custom_allergies.split(',').map((a: string) => a.trim()));
  }

  const dietaryRestrictions = [
    ...(params.dietaryPreferences || []),
    ...(allergies.length > 0 ? [`Avoid these allergens: ${allergies.join(', ')}`] : [])
  ];

  const tastePreferences = profile.taste_profile
    ? Object.entries(profile.taste_profile)
        .filter(([_, value]) => value > 3)
        .map(([taste]) => taste)
    : [];

  return `
You are a creative culinary AI. Generate 2 ${params.recipeType} recipes.
Each recipe should be a ${params.dishType} inspired by ${params.cuisines?.length > 0 ? params.cuisines.join(' & ') as string : 'any'} cuisine(s).
${dietaryRestrictions.length ? `All recipes must respect the following dietary restrictions: ${dietaryRestrictions.join(', ')}.` : ''}
${params.ingredient ? `Include "${params.ingredient}" as a featured ingredient.` : ''}
${tastePreferences.length ? `Emphasize these taste profiles: ${tastePreferences.join(', ')}.` : ''}
${profile.pantry_ingredients?.length ? `Consider using these available ingredients if possible: ${profile.pantry_ingredients.join(', ')}.` : ''}
${params.appearancePrompt ? `Visually, it should appear like: "${params.appearancePrompt}".` : ''}

Return each recipe as a JSON object with this structure:
{
  "name": "Recipe Name",
  "description": "Description",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "preparationTime": "X minutes/hours",
  "difficulty": "Easy/Medium/Hard",
  "servings": number,
  "flavorSummary": "Flavor profile description"
}

Return an array of exactly 2 recipe objects.`;
}

async function fetchFromDeepSeek(promptText: string): Promise<any[]> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: promptText
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    const content = data.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    if (!Array.isArray(parsedContent.recipes)) {
      throw new Error('Invalid recipe format in DeepSeek response');
    }

    return parsedContent.recipes;
  } catch (error) {
    console.error('Error in fetchFromDeepSeek:', error);
    throw error;
  }
}

async function getUserFromToken(token: string): Promise<string> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid authentication');
    }

    return user.id;
  } catch (error) {
    console.error('Auth error:', error);
    throw new Error('Authentication failed');
  }
}

async function saveRecipesToDatabase(recipes: Recipe[], userId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { error } = await supabase.from('recipes').insert(
      recipes.map(recipe => ({
        user_id: userId,
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
      }))
    );

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to save recipes to database');
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authentication');
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = await getUserFromToken(token);

    // Get user profile
    const profile = await getUserProfile(userId);

    // Parse and validate request body
    const params = await req.json() as GenerateRecipeParams;
    if (!params.recipeType || !params.dishType) {
      throw new Error('Missing required parameters');
    }

    // Generate recipes
    const prompt = buildDeepSeekPrompt(params, profile);
    const recipesJson = await fetchFromDeepSeek(prompt);
    
    const recipes: Recipe[] = recipesJson.map((recipe: any) => ({
      ...recipe,
      cuisine: params.cuisines?.join(' & ') || '',
      dietaryPreferences: params.dietaryPreferences || [],
      recipeType: params.recipeType,
      appearancePrompt: params.appearancePrompt,
      dishType: params.dishType,
      imageUrl: `https://source.unsplash.com/1024x1024/?${encodeURIComponent(recipe.name.toLowerCase())}+food+cooking+dish`
    }));

    // Save to database
    await saveRecipesToDatabase(recipes, userId);

    return new Response(
      JSON.stringify(recipes),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: error.message.includes('authentication') ? 401 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});