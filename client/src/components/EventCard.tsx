import { useNavigate } from "react-router-dom";
import { BaseCardProps } from "../types/globals";
import { BASE_URL } from "../App";
import { RiEdit2Fill } from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { FaRegCalendar } from "react-icons/fa";

export type EventCardProps = BaseCardProps & {
  title: string;
  description: string;
  image: string;
  duration?: {
    start: string | null;
    end: string | null;
  };
};

export const EventSkeletonCard = () => (
  <div className="w-[90%] lg:w-2/3 flex border border-white/10 rounded-2xl overflow-hidden animate-pulse">
    <div className="w-[40%] h-80 bg-white/5" />
    <div className="w-[60%] p-6 flex flex-col gap-4 justify-center">
      <div className="w-4/5 h-8 rounded bg-white/10" />
      <div className="w-1/2 h-5 rounded bg-white/5" />
      <div className="w-full h-16 rounded bg-white/5" />
    </div>
  </div>
);

const EventCard = ({ id, title, description, image, duration, handleEdit }: EventCardProps) => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div
      className="w-[90%] lg:w-2/3 flex border border-white/10 rounded-2xl overflow-hidden
        hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(id)}
    >
      <div className="w-[40%] h-80 overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={`${BASE_URL}${image}`}
          alt={title}
        />
      </div>
      <div className="w-[60%] p-6 flex flex-col gap-3 justify-center bg-linear-to-br from-white/5 to-transparent">
        <h1 className="text-primary text-xl font-bold">{title}</h1>
        {duration && (
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <FaRegCalendar className="text-primary" />
            <span>{formatDate(duration.start)}{duration.end && duration.end !== duration.start ? ` — ${formatDate(duration.end)}` : ""}</span>
          </div>
        )}
        <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{description}</p>
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm font-semibold group-hover:underline">View details</span>
          {authState.user?.role === "admin" && (
            <div
              className="border border-primary/30 text-primary rounded-lg p-1.5 hover:bg-primary hover:text-black
                cursor-pointer transition-all"
              onClick={(e) => { e.stopPropagation(); handleEdit?.(id); }}
            >
              <RiEdit2Fill className="text-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
