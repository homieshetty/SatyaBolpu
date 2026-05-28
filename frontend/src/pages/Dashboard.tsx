import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaPencilAlt, FaStar, FaHandsHelping, FaRegCalendar, FaRegBookmark } from "react-icons/fa";
import Button from "../components/Button";
import { TfiWrite } from "react-icons/tfi";
import { BsFilePost } from "react-icons/bs";
import { FaArrowUpLong, FaLocationDot, FaPeopleGroup } from "react-icons/fa6";
import { MdOutlineExplore } from "react-icons/md";
import { VscFileSubmodule } from "react-icons/vsc";
import FilterTable from "../components/FilterTable";

const data = [
  { month: "Jan 2025", posts: 4 },
  { month: "Feb 2025", posts: 7 },
  { month: "Mar 2025", posts: 20 },
  { month: "Apr 2025", posts: 4 },
  { month: "May 2025", posts: 7 },
  { month: "Jun 2025", posts: 20 },
];

const Dashboard = () => {
  const { state } = useAuth();

  if (!state.token) return <Navigate to="/login" replace />
  
  return (
    <div
      className="w-full flex flex-col items-center justify-center my-10"
    >

      <div 
        className="w-1/5"
      >

      </div>

      <div
        className="w-3/5"
      >
        {/* Greetings */}
        <div className="w-full flex gap-1 text-[2rem] mb-5">
          <p className="text-primary">Hello,</p>
          <p className="text-white">{state.user?.name}</p>
        </div>

        {/* Stats */}
        <div className="w-full flex items-center justify-around">

          <div
            className="w-1/4 text-primary flex gap-2 transition-all
              p-1 rounded-lg cursor-pointer hover:-translate-y-2"
          >
            <BsFilePost size={'40px'} className="mt-3" />
            <div className="text-white">
              <div className="text-white text-[1.5rem]">0</div>
              <div className="text-[0.8rem]">Posts</div>
              <div className="flex items-center justify-center text-green-400 text-[0.65rem]">
                <FaArrowUpLong size={'8px'} />
                8 this week
              </div>
            </div>
          </div>

          <div
            className="w-1/4 text-primary flex gap-2 transition-all
              p-1 rounded-lg cursor-pointer hover:-translate-y-2"
          >
            <FaRegCalendar size={'40px'} className="mt-3" />
            <div className="text-white">
              <div className="text-white text-[1.5rem]">0</div>
              <div className="text-[0.8rem]">Events</div>
              <div className="flex items-center justify-center text-green-400 text-[0.65rem]">
                <FaArrowUpLong size={'8px'} />
                8 this week
              </div>
            </div>
          </div>

          <div
            className="w-1/4 text-primary flex gap-2 transition-all
              p-1 rounded-lg cursor-pointer hover:-translate-y-2"
          >
            <FaPeopleGroup size={'40px'} className="mt-3" />
            <div className="text-white">
              <div className="text-white text-[1.5rem]">0</div>
              <div className="text-[0.8rem]">Community Blogs</div>
              <div className="flex items-center justify-center text-green-400 text-[0.65rem]">
                <FaArrowUpLong size={'8px'} />
                8 this week
              </div>
            </div>
          </div>

          <div
            className="w-1/4 text-primary flex gap-2 transition-all
              p-1 rounded-lg cursor-pointer hover:-translate-y-2"
          >
            <FaLocationDot size={'40px'} className="mt-3" />
            <div className="text-white">
              <div className="text-white text-[1.5rem]">0</div>
              <div className="text-[0.8rem]">Mapped Locations</div>
              <div className="flex items-center justify-center text-green-400 text-[0.65rem]">
                <FaArrowUpLong size={'8px'} />
                8 this week
              </div>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="w-full mt-20 flex flex-col gap-3 text-nowrap">
          <div className="text-white text-[1.25rem]">
            Quick Actions
          </div>
          <div className="flex items-center justify-around">

            <div 
              className="group flex flex-col items-center justify-center text-white
                gap-2 hover:bg-primary p-2 cursor-pointer rounded-lg w-32
              hover:text-black"
            >
              <TfiWrite className="text-primary group-hover:text-black" size={'40px'}/>
              Write Blog
            </div>

            <div 
              className="group flex flex-col items-center justify-center text-white
                gap-2 hover:bg-primary p-2 cursor-pointer rounded-lg w-32
              hover:text-black"
            >
              <FaHandsHelping className="text-primary group-hover:text-black" size={'40px'}/>
              Contribute
            </div>

            <div 
              className="group flex flex-col items-center justify-center text-white
                gap-2 hover:bg-primary p-2 cursor-pointer rounded-lg w-32
              hover:text-black"
            >
              <MdOutlineExplore className="text-primary group-hover:text-black" size={'40px'}/>
              Explore
            </div>

            <div 
              className="group flex flex-col items-center justify-center text-white
                gap-2 hover:bg-primary p-2 cursor-pointer rounded-lg w-32
              hover:text-black"
            >
              <VscFileSubmodule className="text-primary group-hover:text-black" size={'40px'}/>
              Submissions
            </div>

            <div 
              className="group flex flex-col items-center justify-center text-white
                gap-2 hover:bg-primary p-2 cursor-pointer rounded-lg w-32
              hover:text-black"
            >
              <FaRegBookmark className="text-primary group-hover:text-black" size={'40px'}/>
              Saved
            </div>

          </div>
        </div>

        {/* Recent Updates */}
        <div className="w-full my-20 flex flex-col gap-3">
          <div className="text-white text-[1.25rem]">
            Recent Updates
          </div>
          <div>
            <FilterTable 
              filters={[
                {
                  name: 'All',
                  endpoint: 'feed',
                  key: "feed"
                },
                {
                  name: 'Posts',
                  endpoint: 'posts?fields=title,image,userId&limit=5',
                  key: 'posts'
                },
                {
                  name: 'Cultures',
                  endpoint: 'cultures?fields=title,image,userId&limit=5',
                  key: 'cultures'
                },
                {
                  name: 'Events',
                  endpoint: 'events?fields=title,image,userId&limit=5',
                  key: 'events'
                },
                {
                  name: 'Blogs',
                  endpoint: 'blogs?fields=title,image,userId&limit=5',
                  key: 'blogs'
                }
              ]}
            />
          </div>
        </div>

      </div>

      <div
        className="w-1/5"
      >

      </div>

    </div>
  )
}

export default Dashboard;