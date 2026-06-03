import { MdDrafts } from "react-icons/md";
import { BsFilePost } from "react-icons/bs";
import { GiByzantinTemple } from "react-icons/gi";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Title from "../../components/Title";
import useApi from "../../hooks/useApi";
import { FaRegCalendar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

const Add = () => {
  const navigate = useNavigate();
  const draftsApi = useApi("/drafts", { auto: false });

  const { state: authState } = useAuth();

  const handleClick = async (type: "post" | "culture" | "event" | "location") => {
    const res = await draftsApi.post({ type });
    if(!res) return;
    navigate(`${type}/${res.id}`);
  }

  if(!authState.token || authState.user?.role !== "admin")
    return <Navigate to={"/404"} replace/>

  return (
    <div className="w-screen my-20">
      <Title title="Add"/>

      <div className="w-2/3 mx-auto md:w-1/2 lg:w-1/3 flex flex-col items-center justify-center gap-5 text-black my-20">
        <div 
          className="w-full flex items-center gap-5 font-black text-[1.5rem] md:text-[2rem] bg-white p-5 rounded-2xl
            cursor-pointer hover:bg-primary hover:text-white hover:scale-105 transition-all"
          onClick={() => navigate("/add/draft")}
        >
          <p className="ml-auto">Drafts</p>
          <MdDrafts className="ml-auto"/>
        </div>
        <div 
          className="w-full flex items-center gap-5 font-black text-[1.5rem] md:text-[2rem] bg-white p-5 rounded-2xl
            cursor-pointer hover:bg-primary hover:text-white hover:scale-105 transition-all"
          onClick={() => handleClick("post")}
        >
          <p className="ml-auto">Post</p>
          <BsFilePost className="ml-auto"/>
        </div>
        <div 
          className="w-full flex items-center gap-5 font-black text-[1.5rem] md:text-[2rem] bg-white p-5 rounded-2xl
            cursor-pointer hover:bg-primary hover:text-white hover:scale-105 transition-all"
          onClick={() => handleClick("culture")}
        >
          <p className="ml-auto">Culture</p>
          <GiByzantinTemple className="ml-auto" />
        </div>
        <div 
          className="w-full flex items-center gap-5 font-black text-[1.5rem] md:text-[2rem] bg-white p-5 rounded-2xl
            cursor-pointer hover:bg-primary hover:text-white hover:scale-105 transition-all"
          onClick={() => handleClick("event")}
        >
          <p className="ml-auto">Event</p>
          <FaRegCalendar className="ml-auto" strokeWidth={"10px"}/>
        </div>
        <div 
          className="w-full flex items-center gap-5 font-black text-[1.5rem] md:text-[2rem] bg-white p-5 rounded-2xl
            cursor-pointer hover:bg-primary hover:text-white hover:scale-105 transition-all"
          onClick={() => handleClick("location")}
        >
          <p className="ml-auto">Location</p>
          <FaLocationDot className="ml-auto" strokeWidth={"10px"}/>
        </div>
        <div 
          className="w-full flex items-center gap-5 font-black text-[1.5rem] md:text-[2rem] bg-white p-5 rounded-2xl
            cursor-pointer hover:bg-primary hover:text-white hover:scale-105 transition-all"
          onClick={() => navigate("/add/others")}>
          <p className="ml-auto">Others</p>
          <p className="ml-auto">...</p>
        </div>
      </div>
    </div>
  )
}

export default Add;
