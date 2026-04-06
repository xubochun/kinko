import Icon from '../../../../components/Icon';

interface ActionMenuProps {
  onEdit: (e: React.MouseEvent | React.TouchEvent) => void;
  onDelete: (e: React.MouseEvent | React.TouchEvent) => void;
  onClose: (e: React.MouseEvent | React.TouchEvent) => void;
  className?: string;
  itemClassName?: string;
}

export default function ActionMenu({
  onEdit,
  onDelete,
  onClose,
  className = '',
  itemClassName = 'h-12 w-12',
}: ActionMenuProps) {
  return (
    <div
      className={`absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center gap-10 rounded-2xl animate-in fade-in zoom-in duration-200 ${className}`}
    >
      <button
        onClick={onEdit}
        className="text-blue-600 active:scale-90 transition-transform"
      >
        <div
          className={`${itemClassName} rounded-full bg-blue-50 flex items-center justify-center`}
        >
          <Icon name="edit-3" className="h-6 w-6" />
        </div>
      </button>
      <button
        onClick={onDelete}
        className="text-red-600 active:scale-90 transition-transform"
      >
        <div
          className={`${itemClassName} rounded-full bg-red-50 flex items-center justify-center`}
        >
          <Icon name="trash-2" className="h-6 w-6" />
        </div>
      </button>
      <button
        onClick={onClose}
        className="text-slate-500 active:scale-90 transition-transform"
      >
        <div
          className={`${itemClassName} rounded-full bg-slate-100 flex items-center justify-center`}
        >
          <Icon name="x" className="h-6 w-6" />
        </div>
      </button>
    </div>
  );
}
