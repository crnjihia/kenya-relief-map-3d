import React from 'react';

export default function Legend() {
  const gradient = 'linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)';
  return (
    <div className="flex items-center space-x-2 mt-2">
      <span className="text-sm">Low</span>
      <div className="flex-1 h-4" style={{ background: gradient }} />
      <span className="text-sm">High</span>
    </div>
  );
}
