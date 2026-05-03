import React from 'react';
import { MapPin, Navigation, Clock, Share2 } from 'lucide-react';

const BoothCard = ({ booth, onDirections, onShare }) => {
  if (!booth) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card animate-slide-up">
      <div className="flex items-start gap-4">
        {/* Booth icon */}
        <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🏫</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 leading-tight">
            {booth.name || 'Polling Booth'}
          </h3>
          {booth.room && (
            <p className="text-sm text-gray-500 mt-0.5">{booth.room}</p>
          )}
          <p className="text-sm text-gray-600 mt-1 flex items-start gap-1">
            <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <span>{booth.address || 'Address not available'}</span>
          </p>
        </div>

        {/* Distance badge */}
        {booth.distance && (
          <div className="flex-shrink-0 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {booth.distance}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={onDirections}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white gradient-orange transition-transform active:scale-95"
          id="booth-directions-btn"
        >
          <Navigation size={18} />
          DIRECTIONS
        </button>
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-gray-700 border-2 border-gray-200 hover:border-primary transition-colors"
          id="booth-share-btn"
        >
          <Share2 size={18} />
          SHARE
        </button>
      </div>
    </div>
  );
};

export default BoothCard;
