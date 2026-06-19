import { useNavigate } from 'react-router-dom';
import { BaseCardProps } from '../types/globals';
import { BASE_URL } from '../App';
import { RiEdit2Fill } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

export type PostCardProps = BaseCardProps & {
  title: string;
  shortTitle: string;
  description: string;
  coverImage: string;
};

export const PostSkeletonCard = () => (
  <div className="w-[90%] lg:w-2/3 flex border border-white/10 rounded-2xl overflow-hidden animate-pulse">
    <div className="w-[40%] h-80 bg-white/5" />
    <div className="w-[60%] p-6 flex flex-col gap-4 justify-center">
      <div className="w-4/5 h-8 rounded bg-white/10" />
      <div className="w-full h-20 rounded bg-white/5" />
    </div>
  </div>
);

const PostCard = ({
  id,
  title,
  description,
  coverImage,
  handleEdit,
}: PostCardProps) => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();

  return (
    <div
      className="w-[90%] lg:w-2/3 flex border border-white/10 rounded-2xl overflow-hidden
        hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(id)}
    >
      <div className="w-[40%] h-80 overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={`${BASE_URL}${coverImage}`}
          alt={title}
        />
      </div>
      <div className="w-[60%] p-6 flex flex-col gap-4 justify-center bg-linear-to-br from-white/5 to-transparent">
        <h1 className="text-primary text-xl font-bold">{title}</h1>
        <p className="text-white/70 text-sm leading-relaxed line-clamp-4">
          {description}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm font-semibold group-hover:underline">
            Read more
          </span>
          {authState.user?.role === 'admin' && (
            <div
              className="border border-primary/30 text-primary rounded-lg p-1.5 hover:bg-primary hover:text-black
                cursor-pointer transition-all"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit?.(id);
              }}
            >
              <RiEdit2Fill className="text-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
