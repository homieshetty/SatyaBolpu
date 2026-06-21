import { Route, Routes } from 'react-router-dom';
import NotFound from './components/NotFound';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Map from './pages/MAP';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Culture from './pages/Culture';
import Lenis from 'lenis';
import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Posts from './pages/Posts';
import Post from './pages/Post';
import Cultures from './pages/Cultures';
import Drafts from './pages/Admin/Drafts';
import Others from './pages/Admin/Others';
import Events from './pages/Events';
import Blogs from './pages/Blogs';
import Create from './pages/Create';
import Contact from './pages/Contact';
import About from './pages/About';
import FAQ from './pages/FAQ';
import New from './pages/Admin/New';
import Donate from './pages/Donate';
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
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        limit={5}
        toastClassName={`relative font-semibold flex p-4 min-h-10 max-w-fit text-md rounded-md 
          justify-between overflow-hidden cursor-pointer m-2 shadow-lg`}
        closeButton={true}
        hideProgressBar={false}
        draggable={true}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        pauseOnHover={true}
        theme="dark"
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
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/create" element={<Create />} />
        <Route path="/create/others" element={<Others />} />
        <Route path="/create/draft" element={<Drafts />} />
        <Route path="/create/post/:id" element={<New type="post" />} />
        <Route path="/create/culture/:id" element={<New type="culture" />} />
        <Route path="/create/event/:id" element={<New type="event" />} />
        <Route path="/create/location/:id" element={<New type="location" />} />
        <Route path="/create/tag" element={<New type="tag" />} />
        <Route path="/create/post-type" element={<New type="post-type" />} />
        <Route path="/create/post-group" element={<New type="post-group" />} />
        <Route path="/map" element={<Map />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
