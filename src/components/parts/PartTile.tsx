import React from 'react';
import { PartIcon } from './PartIcons';

interface PartTileProps {
  id: string;
  name: string;
  selected?: boolean;
  placed?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  size?: number;
}

export function PartTile({ id, name, selected, placed, dimmed, onClick, size = 56 }: PartTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={placed}
      className={`part-tile ${
        placed
          ? 'bg-accent/20 text-muted-foreground'
          : selected
            ? 'bg-primary/15 ring-2 ring-primary scale-[1.03]'
            : dimmed
              ? 'bg-muted/40 text-muted-foreground'
              : 'bg-card hover:bg-muted/60'
      }`}
    >
      <PartIcon id={id} size={size} className={placed ? 'opacity-50' : ''} />
      <span className="text-xs font-extrabold leading-tight text-center px-0.5">{name}</span>
    </button>
  );
}
