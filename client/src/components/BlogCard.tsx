import { useNavigate } from "react-router-dom";
import { BaseCardProps } from "../types/globals";
import { BASE_URL } from "../App";

export type BlogCardProps = BaseCardProps & {
  title: string;
  subtitle: string;
  image: string;
  user: {
    name: string;
    image: string;
    uname: string;
  } | null;
  createdAt: string;
};

export const BlogSkeletonCard = () => (
  <div className="w-full flex items-center gap-5 bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse">
    <div className="w-24 h-24 rounded-xl bg-white/10 flex-shrink-0" />
    <div className="flex-1 flex flex-col gap-3">
      <div className="w-3/4 h-6 rounded bg-white/10" />
      <div className="w-full h-4 rounded bg-white/5" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white/10" />
        <div className="w-20 h-3 rounded bg-white/5" />
        <div className="w-16 h-3 rounded bg-white/5 ml-auto" />
      </div>
    </div>
  </div>
);

const BlogCard = ({ id, title, subtitle, image, user, createdAt }: BlogCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full flex items-center gap-5 bg-white/5 border border-white/10 rounded-2xl p-4
        hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(id)}
    >
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={`${BASE_URL}${image}`}
          alt={title}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <h3 className="text-white font-bold text-lg truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">
          {subtitle}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {user && (
            <>
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                {user.image ? (
                  <img
                    className="w-full h-full object-cover"
                    src={`${BASE_URL}${user.image}`}
                    alt={user.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[0.6rem] text-white/50 font-bold uppercase">
                    {user.name?.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-white/40 text-xs truncate">{user.name}</span>
            </>
          )}
          <span className="text-white/30 text-xs ml-auto flex-shrink-0">
            {new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
