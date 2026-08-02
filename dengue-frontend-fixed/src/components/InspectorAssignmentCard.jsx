import React from 'react';

/**
 * InspectorAssignmentCard
 * Props:
 *   inspector  — { user_id, full_name, phone_number, email, is_available }
 *   isSelected — bool
 *   onSelect   — fn(inspector)
 */
const InspectorAssignmentCard = ({ inspector, isSelected, onSelect }) => {
  const available = inspector.is_available !== false; // treat undefined as available

  return (
    <button
      onClick={() => available && onSelect(inspector)}
      disabled={!available}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-150 
        ${!available
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          : isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer'
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Avatar + info */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
              ${available ? (isSelected ? 'bg-blue-600' : 'bg-red-600') : 'bg-gray-400'}`}
          >
            {inspector.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className={`font-semibold text-sm ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>
              {inspector.full_name}
            </p>
            {inspector.phone_number && (
              <p className="text-xs text-gray-500 mt-0.5">📞 {inspector.phone_number}</p>
            )}
            {inspector.email && !inspector.phone_number && (
              <p className="text-xs text-gray-500 mt-0.5">✉️ {inspector.email}</p>
            )}
          </div>
        </div>

        {/* Availability badge + checkmark */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full
              ${available
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-500'
              }`}
          >
            {available ? 'Available' : 'Busy'}
          </span>
          {isSelected && (
            <span className="text-blue-600 text-lg leading-none">✓</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default InspectorAssignmentCard;
