import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { supabase } from '../services/supabase';

const ALLERGY_OPTIONS = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy',
  'Wheat', 'Fish', 'Shellfish', 'Sesame'
];

interface Profile {
  username: string | null;
  allergies: string[];
  custom_allergies: string;
  taste_profile: {
    spicy: number;
    sweet: number;
    tangy: number;
    umami: number;
    bitter: number;
    savory: number;
  };
  pantry_ingredients: string[];
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile>({
    username: '',
    allergies: [],
    custom_allergies: '',
    taste_profile: {
      spicy: 3,
      sweet: 3,
      tangy: 3,
      umami: 3,
      bitter: 3,
      savory: 3
    },
    pantry_ingredients: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          allergies: profile.allergies,
          custom_allergies: profile.custom_allergies,
          taste_profile: profile.taste_profile,
          pantry_ingredients: profile.pantry_ingredients
        })
        .eq('id', user.id);

      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleAllergy = (allergy: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const updateTasteProfile = (taste: keyof Profile['taste_profile'], value: number) => {
    setProfile(prev => ({
      ...prev,
      taste_profile: {
        ...prev.taste_profile,
        [taste]: value
      }
    }));
  };

  const addPantryIngredient = () => {
    if (!newIngredient.trim()) return;
    setProfile(prev => ({
      ...prev,
      pantry_ingredients: [...prev.pantry_ingredients, newIngredient.trim()]
    }));
    setNewIngredient('');
  };

  const removePantryIngredient = (ingredient: string) => {
    setProfile(prev => ({
      ...prev,
      pantry_ingredients: prev.pantry_ingredients.filter(i => i !== ingredient)
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg">
          Profile updated successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={profile.username || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Choose a username"
          />
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergies & Intolerances
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {ALLERGY_OPTIONS.map(allergy => (
              <button
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  profile.allergies.includes(allergy)
                    ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {allergy}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={profile.custom_allergies}
            onChange={(e) => setProfile(prev => ({ ...prev, custom_allergies: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Other allergies (comma separated)"
          />
        </div>

        {/* Taste Profile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Taste Preferences
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(profile.taste_profile).map(([taste, value]) => (
              <div key={taste}>
                <label className="block text-sm text-gray-600 mb-2 capitalize">
                  {taste} ({value})
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={value}
                  onChange={(e) => updateTasteProfile(taste as keyof Profile['taste_profile'], parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pantry Ingredients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pantry Ingredients
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Add ingredient"
              onKeyPress={(e) => e.key === 'Enter' && addPantryIngredient()}
            />
            <button
              onClick={addPantryIngredient}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.pantry_ingredients.map((ingredient) => (
              <div
                key={ingredient}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
              >
                <span>{ingredient}</span>
                <button
                  onClick={() => removePantryIngredient(ingredient)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>
    </div>
  );
}