import React from 'react';

interface IngredientInputProps {
  value: string;
  onChange: (value: string) => void;
}

function IngredientInput({ value, onChange }: IngredientInputProps) {
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-700">
        Want to include a specific ingredient?
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., strawberry, cardamom, chocolate..."
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

export default IngredientInput;