import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { MdArticle } from "react-icons/md";
import { PiHandsPrayingBold } from "react-icons/pi";
import { GiPartyFlags } from "react-icons/gi";
import { FaMapLocationDot } from "react-icons/fa6";
import { BsPencilSquare } from "react-icons/bs";

const cards = [
  {
    label: "Posts",
    desc: "Stories, articles & insights",
    icon: MdArticle,
    path: "/posts",
    accent: "from-orange-500/20 to-orange-600/5",
    iconColor: "text-orange-400",
  },
  {
    label: "Cultures",
    desc: "Traditions & heritage of Tulunadu",
    icon: PiHandsPrayingBold,
    path: "/cultures",
    accent: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-400",
  },
  {
    label: "Events",
    desc: "Upcoming celebrations & festivals",
    icon: GiPartyFlags,
    path: "/events",
    accent: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
  {
    label: "Blogs",
    desc: "Community voices & personal stories",
    icon: BsPencilSquare,
    path: "/blogs",
    accent: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
  },
  {
    label: "Map",
    desc: "Explore locations across the region",
    icon: FaMapLocationDot,
    path: "/map",
    accent: "from-sky-500/20 to-sky-600/5",
    iconColor: "text-sky-400",
  },
];

const Explore = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen min-h-screen py-20 flex flex-col items-center">
      <Title title="Explore" />

      <div className="w-[90%] sm:w-2/3 lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
        {cards.map(({ label, desc, icon: Icon, path, accent, iconColor }, i) => (
          <div
            key={label}
            className={`group relative flex flex-col items-center justify-center gap-3
              bg-linear-to-br ${accent} border border-white/10 rounded-2xl p-8
              cursor-pointer hover:border-primary/50 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10
              transition-all duration-300
              ${i === cards.length - 1 && cards.length % 3 === 1 ? "lg:col-start-2" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon
              className={`${iconColor} text-4xl group-hover:text-primary transition-colors duration-300`}
            />
            <p className="text-white font-bold text-xl group-hover:text-primary transition-colors duration-300">
              {label}
            </p>
            <p className="text-white/50 text-sm text-center group-hover:text-white/70 transition-colors duration-300">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
