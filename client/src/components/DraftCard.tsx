import { BaseCardProps } from '../types/globals';
import { RiEdit2Fill } from 'react-icons/ri';
import { MdDelete } from 'react-icons/md';

export type DraftCardProps = BaseCardProps & {
  title: string;
  type?: string;
};

export const DraftSkeletonCard = () => (
  <div className="w-[90%] lg:w-1/2 p-4 px-6 flex items-center justify-between bg-white/5 rounded-xl animate-pulse">
    <div className="w-1/3 h-6 rounded bg-white/10" />
    <div className="w-12 h-6 rounded bg-white/5" />
  </div>
);

const DraftCard = ({
  id,
  title,
  type,
  handleEdit,
  handleDelete,
}: DraftCardProps) => {
  return (
    <div
      className="w-[90%] lg:w-1/2 flex items-center justify-between p-4 px-6
        bg-white/5 border border-white/10 rounded-xl
        hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <span className="text-primary font-bold text-lg">
          {title || 'Untitled Draft'}
        </span>
        {type && (
          <span className="text-white/40 text-xs uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
            {type}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div
          className="border border-primary/30 text-primary rounded-lg p-1.5 hover:bg-primary hover:text-black
            cursor-pointer transition-all"
          onClick={() => handleEdit?.(id)}
        >
          <RiEdit2Fill className="text-lg" />
        </div>
        <div
          className="border border-red-500/30 text-red-400 rounded-lg p-1.5 hover:bg-red-500 hover:text-black
            cursor-pointer transition-all"
          onClick={() => handleDelete?.(id)}
        >
          <MdDelete className="text-lg" />
        </div>
      </div>
    </div>
  );
};

export default DraftCard;
