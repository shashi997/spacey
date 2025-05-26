import React from 'react'

const Badge = ({ name, imageUrl, description, earned }) => {
    if (!earned) {
      return null; // Don't render if not earned
    }
  
    return (
      <div className="bg-yellow-100 border-2 border-yellow-400 p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <h3 className="text-2xl font-bold text-yellow-700 mb-3">Badge Earned!</h3>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${name} Badge`}
            className="w-24 h-24 mx-auto mb-3 rounded-full shadow-md"
          />
        ) : (
          <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-yellow-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
            🏆
          </div>
        )}
        <p className="text-xl font-semibold text-yellow-600">{name}</p>
        {description && <p className="text-sm text-yellow-500 mt-1">{description}</p>}
      </div>
    );
};
  
  Badge.defaultProps = {
    earned: false,
    name: 'Cosmic Achiever',
    description: 'For outstanding performance!',
    // You can set a default imageUrl or let it use the emoji placeholder
    // imageUrl: 'https://via.placeholder.com/100?text=Badge',
  };

export default Badge