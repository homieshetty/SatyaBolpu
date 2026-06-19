import { MdDrafts } from 'react-icons/md';
import { BsFilePost } from 'react-icons/bs';
import { GiByzantinTemple } from 'react-icons/gi';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Title from '../components/Title';
import useApi from '../hooks/useApi';
import { FaRegCalendar } from 'react-icons/fa';
import { FaLocationDot, FaEllipsis } from 'react-icons/fa6';

const cards = [
  {
    label: 'Drafts',
    desc: 'Continue where you left off',
    icon: MdDrafts,
    role: 'admin',
    action: 'drafts' as const,
    accent: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
  },
  {
    label: 'Post',
    desc: 'Spread knowledge and awareness',
    icon: BsFilePost,
    role: 'admin',
    action: 'post' as const,
    accent: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'text-orange-400',
  },
  {
    label: 'Culture',
    desc: 'Preserve traditions and heritage',
    icon: GiByzantinTemple,
    role: 'admin',
    action: 'culture' as const,
    accent: 'from-rose-500/20 to-rose-600/5',
    iconColor: 'text-rose-400',
  },
  {
    label: 'Event',
    desc: 'Add upcoming celebrations',
    icon: FaRegCalendar,
    role: 'user',
    action: 'event' as const,
    accent: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
  },
  {
    label: 'Blog',
    desc: 'Share stories and articles',
    icon: FaRegCalendar,
    role: 'user',
    action: 'blog' as const,
    accent: 'from-fuchsia-500/20 to-fuchsia-600/5',
    iconColor: 'text-emerald-400',
  },
  {
    label: 'Location',
    desc: 'Pin places on the map',
    icon: FaLocationDot,
    role: 'user',
    action: 'location' as const,
    accent: 'from-sky-500/20 to-sky-600/5',
    iconColor: 'text-sky-400',
  },
  {
    label: 'Others',
    desc: 'Tags, post types & groups',
    icon: FaEllipsis,
    role: 'admin',
    action: 'others' as const,
    accent: 'from-violet-500/20 to-violet-600/5',
    iconColor: 'text-violet-400',
  },
];

const Create = () => {
  const navigate = useNavigate();
  const draftsApi = useApi('/drafts', { auto: false });

  const { state: authState } = useAuth();

  const handleClick = async (
    type: 'post' | 'culture' | 'event' | 'location' | 'blog',
  ) => {
    const res = await draftsApi.post({ type });
    if (!res) return;
    navigate(`${type}/${res.id}`);
  };

  if (!authState.token) return <Navigate to={'/404'} replace />;

  return (
    <div className="w-screen min-h-screen py-20 flex flex-col items-center">
      <Title title="Create" />

      <div className="w-[90%] sm:w-2/3 lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
        {cards
          .filter(
            (c) =>
              authState.user?.role === 'admin' ||
              authState.user?.role === c.role,
          )
          .map(({ label, desc, icon: Icon, action, accent, iconColor }, i) => (
            <div
              key={label}
              className={`group relative flex flex-col items-center justify-center gap-3
              bg-linear-to-br ${accent} border border-white/10 rounded-2xl p-8
              cursor-pointer hover:border-primary/50 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10
              transition-all duration-300
              ${i === cards.length - 1 && cards.length % 3 === 1 ? 'lg:col-start-2' : ''}`}
              onClick={() => {
                if (action === 'drafts') navigate('/create/draft');
                else if (action === 'others') navigate('/create/others');
                else handleClick(action);
              }}
            >
              <Icon
                className={`${iconColor} text-4xl group-hover:text-primary transition-colors duration-300`}
                strokeWidth={label === 'Event' ? '10px' : undefined}
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

export default Create;
