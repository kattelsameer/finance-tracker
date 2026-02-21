import { ReactNode } from 'react';

interface DraggableCardProps {
  children: ReactNode;
  id: string;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

export function DraggableCard({
  children,
  id,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging = false,
}: DraggableCardProps) {

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(index);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEnd}
      className={`relative transition-all duration-200 h-full ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}
      data-card-id={id}
    >
      <div className="h-full">
        {children}
      </div>
    </div>
  );
}
