import React from 'react';
import { Wand2 } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
}

function GenerateButton({ onClick }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 font-medium"
    >
      <Wand2 className="w-5 h-5" />
      <span>Generate Magical Recipe</span>
    </button>
  );
}

export default GenerateButton;