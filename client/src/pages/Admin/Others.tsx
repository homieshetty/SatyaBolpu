import { FaHashtag } from 'react-icons/fa6';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Title from '../../components/Title';
import { VscGroupByRefType, VscTypeHierarchySub } from 'react-icons/vsc';

const cards = [
  {
    label: 'Tag',
    desc: 'Organize content with labels',
    icon: FaHashtag,
    path: '/create/tag',
    accent: 'from-cyan-500/20 to-cyan-600/5',
    iconColor: 'text-cyan-400',
  },
  {
    label: 'Post Type',
    desc: 'Define categories for posts',
    icon: VscTypeHierarchySub,
    path: '/create/post-type',
    accent: 'from-lime-500/20 to-lime-600/5',
    iconColor: 'text-lime-400',
  },
  {
    label: 'Post Group',
    desc: 'Cluster related posts together',
    icon: VscGroupByRefType,
    path: '/create/post-group',
    accent: 'text-fuchsia-500/20 to-fuchsia-600/5',
    iconColor: 'text-fuchsia-400',
  },
];

const Others = () => {
  const navigate = useNavigate();

  const { state: authState } = useAuth();

  if (!authState.token || authState.user?.role !== 'admin')
    return <Navigate to={'/404'} replace />;

  return (
    <div className="w-screen min-h-screen py-20 flex flex-col items-center">
      <Title title="Others" />

      <div className="w-[90%] sm:w-2/3 lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
        {cards.map(({ label, desc, icon: Icon, path, accent, iconColor }) => (
          <div
            key={label}
            className={`group relative flex flex-col items-center justify-center gap-3
              bg-linear-to-br ${accent} border border-white/10 rounded-2xl p-8
              cursor-pointer hover:border-primary/50 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10
              transition-all duration-300`}
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

export default Others;
