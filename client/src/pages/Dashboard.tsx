import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHandsHelping, FaRegBookmark } from 'react-icons/fa';
import { TfiWrite } from 'react-icons/tfi';
import { FaArrowUpLong } from 'react-icons/fa6';
import { MdOutlineExplore } from 'react-icons/md';
import { VscFileSubmodule } from 'react-icons/vsc';
import FilterTable from '../components/FilterTable';
import Map from './MAP';
import Button from '../components/Button';

const Dashboard = () => {
  const { state } = useAuth();
  const navigate = useNavigate();

  if (!state.token) return <Navigate to="/login" replace />;

  return (
    <div className="w-full min-h-screen px-6 md:px-10 py-10 bg-black text-white">
      <div className="w-full mb-8">
        <div className="w-full rounded-2xl bg-linear-to-r from-black/60 via-black/40 to-black/60 backdrop-blur-sm border border-primary/30 p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="text-primary text-lg font-semibold">
              Welcome back
            </div>
            <div className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
              {state.user?.name ?? 'SatyaBolpu User'}
            </div>
            <p className="mt-3 text-sm text-slate-300 max-w-2xl">
              Explore contributions, manage content, and discover new cultural
              highlights from Tulunadu. Your dashboard gives a quick launchpad
              for publishing, mapping, and moderation.
            </p>
          </div>

          <div className="w-full md:w-72 flex flex-col gap-3">
            <div className="w-full p-4 rounded-xl bg-white/5 border border-primary/20">
              <div className="text-sm text-slate-300">Membership</div>
              <div className="text-primary font-bold text-2xl">
                {state.user?.role ?? 'member'}
              </div>
            </div>
            <div className="w-full p-4 rounded-xl bg-white/5 border border-primary/20 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Reputation</div>
                <div className="text-white font-bold text-xl">42</div>
              </div>
              <div className="text-primary text-3xl font-extrabold">ॐ</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-primary/20 shadow-md flex flex-col">
              <div className="text-primary text-sm font-semibold">Posts</div>
              <div className="text-white text-2xl font-bold">0</div>
              <div className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                <FaArrowUpLong className="text-green-400" /> 8 this week
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-primary/20 shadow-md flex flex-col">
              <div className="text-primary text-sm font-semibold">Events</div>
              <div className="text-white text-2xl font-bold">0</div>
              <div className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                <FaArrowUpLong className="text-green-400" /> 3 upcoming
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-primary/20 shadow-md flex flex-col">
              <div className="text-primary text-sm font-semibold">
                Community
              </div>
              <div className="text-white text-2xl font-bold">0</div>
              <div className="text-slate-400 text-xs mt-2">
                Active contributors: 12
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-primary/20 shadow-md flex flex-col">
              <div className="text-primary text-sm font-semibold">
                Mapped Places
              </div>
              <div className="text-white text-2xl font-bold">0</div>
              <div className="text-slate-400 text-xs mt-2">
                Explore the map for hotspots
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/3 border border-primary/10 backdrop-blur-sm">
            <div className="text-white font-semibold mb-3">Quick Actions</div>
            <div className="flex gap-3 flex-wrap">
              <Button
                className="px-4 py-3 rounded-full"
                content={
                  <>
                    <TfiWrite className="inline" />{' '}
                    <span className="ml-2">Create</span>
                  </>
                }
                onClick={() => navigate("/create")}
              />
              <Button
                className="px-4 py-3 rounded-full"
                theme="dark"
                content={
                  <>
                    <FaHandsHelping className="inline" />{' '}
                    <span className="ml-2">Contribute</span>
                  </>
                }
              />
              <Button
                className="px-4 py-3 rounded-full"
                content={
                  <>
                    <MdOutlineExplore className="inline" />{' '}
                    <span className="ml-2">Explore</span>
                  </>
                }
              />
              <Button
                className="px-4 py-3 rounded-full"
                theme="dark"
                content={
                  <>
                    <VscFileSubmodule className="inline" />{' '}
                    <span className="ml-2">Submissions</span>
                  </>
                }
              />
              <Button
                className="px-4 py-3 rounded-full"
                content={
                  <>
                    <FaRegBookmark className="inline" />{' '}
                    <span className="ml-2">Saved</span>
                  </>
                }
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-primary/20">
            <div className="text-white font-semibold mb-4">Recent Updates</div>
            <FilterTable
              filters={[
                { name: 'All', endpoint: 'feed', key: 'feed' },
                {
                  name: 'Posts',
                  endpoint: 'posts?fields=title,coverImage,userId&limit=5',
                  key: 'posts',
                },
                {
                  name: 'Cultures',
                  endpoint: 'cultures?fields=title,coverImage,userId&limit=5',
                  key: 'cultures',
                },
                {
                  name: 'Events',
                  endpoint: 'events?fields=title,coverImage,userId&limit=5',
                  key: 'events',
                },
                {
                  name: 'Blogs',
                  endpoint: 'blogs?fields=title,coverImage,userId&limit=5',
                  key: 'blogs',
                },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-3xl bg-white/5 border border-primary/20 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-primary font-semibold">Nearby Map</div>
              <div className="text-slate-400 text-sm">Interactive</div>
            </div>
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <Map minimal />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
