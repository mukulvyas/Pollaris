import React from 'react';
import { LANGUAGES } from '../constants/languages';

const LanguageGrid = ({ selected, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <h3 className="text-center font-bold text-lg mb-4 text-gray-800">
        Which language would you like to speak in?
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            id={`lang-${lang.code}`}
            onClick={() => onSelect(lang.code)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
              selected === lang.code
                ? 'border-primary bg-primary-50 shadow-md scale-[1.02]'
                : 'border-gray-100 bg-white hover:border-primary-light hover:shadow-sm'
            }`}
          >
            <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-lg font-bold text-primary">
              {lang.script}
            </span>
            <span className="font-medium text-sm text-gray-700">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageGrid;
