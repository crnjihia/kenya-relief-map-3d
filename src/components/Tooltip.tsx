import React from 'react';

type TooltipProps = {
  content: string;
  position: { x: number; y: number };
};

export default function Tooltip({ content, position }: TooltipProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: position.x + 10,
    top: position.y + 10,
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    zIndex: 1000,
  };

  return <div style={style}>{content}</div>;
}
