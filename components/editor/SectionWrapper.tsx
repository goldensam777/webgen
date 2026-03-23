"use client";

interface SectionWrapperProps {
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  isDragOver: boolean;
  children: React.ReactNode;
}

export function SectionWrapper({
  isFirst, isLast, isSelected,
  onSelect, onMoveUp, onMoveDown, onRemove, onEdit,
  onDragStart, onDragOver, onDrop, onDragEnd, isDragOver,
  children,
}: SectionWrapperProps) {
  return (
    <div
      className={`relative group transition-opacity ${isDragOver ? "opacity-50" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {/* Hover / selection outline */}
      <div
        className={`absolute inset-0 pointer-events-none z-10 transition-all
          ${isSelected
            ? "ring-2 ring-blue-500 ring-inset"
            : "group-hover:ring-2 group-hover:ring-blue-300 group-hover:ring-inset"
          }`}
      />

      {/* Floating toolbar */}
      <div
        className={`absolute top-3 right-3 z-20 flex items-center gap-0.5
          bg-white border border-gray-200 rounded-lg shadow-lg px-1 py-1
          transition-opacity
          ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Move up */}
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          title="Monter"
          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-25
            disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Move down */}
        <button
          onClick={onMoveDown}
          disabled={isLast}
          title="Descendre"
          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-25
            disabled:cursor-not-allowed rounded hover:bg-gray-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="w-px h-4 bg-gray-200 mx-0.5" />

        {/* Edit content */}
        <button
          onClick={onEdit}
          title="Éditer le contenu"
          className="p-1.5 text-gray-400 hover:text-blue-600 rounded
            hover:bg-blue-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                 m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={onRemove}
          title="Supprimer"
          className="p-1.5 text-gray-400 hover:text-red-500 rounded
            hover:bg-red-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0
                 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1
                 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {children}
    </div>
  );
}
