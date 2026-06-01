import { Route, Routes } from "react-router-dom"
import NotFound from "./components/NotFound"
import Home from "./pages/Home"
import Explore from "./pages/Explore"
import Map from "./pages/MAP"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import Profile from "./pages/Profile"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard"
import Culture from "./pages/Culture"
import Lenis from "lenis";
import { useLayoutEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/all"
import NewTag from "./pages/Admin/NewTag"
import Posts from "./pages/Posts"
import Post from "./pages/Post"
import Cultures from "./pages/Cultures"
import Drafts from "./pages/Admin/Drafts"
import Others from "./pages/Admin/Others"
import NewPostType from "./pages/Admin/NewPostType"
import NewPostGroup from "./pages/Admin/NewPostGroup"
import Events from "./pages/Events"
import Add from "./pages/Admin/Add"
import New from "./pages/Admin/New"
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

gsap.registerPlugin(ScrollTrigger);

function App() {
  useLayoutEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      allowNestedScroll: true,
      smoothWheel: true,
      duration: 0.8,
      wheelMultiplier: 1,
      syncTouch: true,
      syncTouchLerp: 0.1,
      touchMultiplier: 1.5
    });


    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <ToastContainer
        position='bottom-center'
        autoClose={3000}
        limit={5}
        toastClassName={
          `relative font-semibold flex p-4 min-h-10 max-w-fit text-md rounded-md 
          justify-between overflow-hidden cursor-pointer m-2 shadow-lg`
        }
        closeButton={true}
        hideProgressBar={false}
        draggable={true}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        pauseOnHover={true}
        theme='dark'
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/cultures" element={<Cultures />} />
        <Route path="/cultures/:culture" element={<Culture />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:postId" element={<Post />} />
        <Route path="/events" element={<Events />} />
        <Route path="/add" element={<Add />} />
        <Route path="/add/others" element={<Others />} />
        <Route path="/add/draft" element={<Drafts />} />
        <Route path="/add/post/:id" element={<New type="post" />} />
        <Route path="/add/culture/:id" element={<New type="culture" />} />
        <Route path="/add/event/:id" element={<New type="event" />} />
        <Route path="/add/tag" element={<NewTag />} />
        <Route path="/add/post-type" element={<NewPostType />} />
        <Route path="/add/post-group" element={<NewPostGroup />} />
        <Route path="/map" element={<Map />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App;