import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLoading } from "../context/LoadingContext"
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all"
import { useGSAP } from "@gsap/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination } from "swiper/modules";
import Button from "../components/Button";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import 'swiper/swiper-bundle.css';
import { useAuth } from '../context/AuthContext';
import { buildAnimationProps } from '../constants/Animations';
import { useNavigate } from 'react-router-dom';
import { Marker, Popup } from 'react-leaflet';
import SVGHeader2 from '../constants/SVGHeader2';
import { IEvent } from '../types/globals';
import { PostCardProps } from '../components/PostCard';
import useApi from '../hooks/useApi';
import PostCard from '../components/PostCard';
import { BASE_URL } from "../App";
import MAP from "./MAP";
import { FaRegCalendar } from "react-icons/fa";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

type swiperDataType = {
  title: string;
  images: string[];
  descr: string;
}

const SectionHeading = ({ children, fref }: { children: React.ReactNode; fref?: (el: HTMLDivElement | null) => void }) => (
  <div ref={fref} className="flex flex-col items-center gap-4 mb-8">
    <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl text-center font-black tracking-tight
      text-transparent bg-clip-text bg-linear-to-r from-primary via-amber-400 to-primary
      whitespace-pre-wrap text-wrap leading-tight">
      {children}
    </h2>
    <div className="flex items-center justify-center gap-3 w-4/5 sm:w-2/3 lg:w-1/3">
      <div className="flex-1 h-px bg-linear-to-r from-transparent to-primary/60" />
      <span className="text-primary/80 font-bold drop-shadow-[0_0_8px_rgba(232,129,54,0.4)]">ॐ</span>
      <div className="flex-1 h-px bg-linear-to-l from-transparent to-primary/60" />
    </div>
  </div>
);

const Home = () => {
  const { startLoading, stopLoading } = useLoading();
  const scrollWatcherRef = useRef<HTMLDivElement[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const headingRefs = useRef<HTMLDivElement[]>([]);
  const foliageRefs = useRef<HTMLImageElement[]>([]);
  const imgRefs = useRef<HTMLImageElement[]>([]);
  // const buttonRefs = useRef<HTMLButtonElement[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const swiperOverlayRef = useRef<HTMLDivElement>(null);
  const recentPostRefs = useRef<HTMLDivElement[]>([]);
  const upcomingEventsLineRef = useRef<HTMLDivElement>(null);
  const upcomingEventRefs = useRef<HTMLDivElement[]>([]);
  const bgRefs = useRef<HTMLDivElement[]>([]);

  const [swiperData, setSwiperData] = useState<swiperDataType[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostCardProps[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<IEvent[]>([]);
  const [isHovering, setHovering] = useState<boolean>(false);

  const recentPostsApi = useApi("/posts?fields=shortTitle,description,coverImage&limit=5");
  const upcomingEventsApi = useApi("/events?fields=title,duration,coverImage&limit=5&sortBy=duration.start");

  const navigate = useNavigate();
  const { state } = useAuth();

  useEffect(() => {
    if (recentPostsApi.data) {
      setRecentPosts(recentPostsApi.data.posts);
    }

    if (upcomingEventsApi.data) {
      setUpcomingEvents(upcomingEventsApi.data.events);
    }
  }, [recentPostsApi.data, upcomingEventsApi.data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        startLoading();
        const response = await fetch("/assets/data/data.json");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        if (data.cultures && data.landmarks) {
          setSwiperData(data.cultures);
        } else {
          console.error("Invalid data format");
        }
      } catch (error) {
        console.error(error);
      } finally {
        stopLoading();
      }
    };

    fetchData();
  }, []);

  useLayoutEffect(() => {
    if (recentPostsApi.loading || upcomingEventsApi.loading) return;

    const ctx = gsap.context(() => {
      const runAnimations = (isMobile: boolean) => {

        const animations = buildAnimationProps(
          scrollWatcherRef,
          headingRefs,
          foliageRefs,
          overlayRef,
          imgRefs,
          svgRef,
          mapRef,
          swiperOverlayRef,
          recentPostRefs,
          upcomingEventsLineRef,
          upcomingEventRefs,
          bgRefs,
          // buttonRefs,
          isMobile
        );

        animations.forEach(({ ref, fromVars, toVars }) => {
          gsap.fromTo(ref, fromVars, toVars);
        });

        // console.table(
        //   animations.map(anim => ({
        //     name: anim.name,
        //     exists: !!anim.ref,
        //     isArray: Array.isArray(anim.ref),
        //     length: Array.isArray(anim.ref)
        //       ? anim.ref.length
        //       : 'single'
        //   }))
        // );

      };

      const mm = gsap.matchMedia();
      mm.add("(max-width:768px)", () => runAnimations(true));
      mm.add("(min-width:769px)", () => runAnimations(false));

    });

    return () => ctx.revert();

  }, [swiperData, recentPostsApi, upcomingEvents, recentPostsApi.loading, upcomingEventsApi.loading]);

  return (
    <div className="home w-screen bg-black">

      <div className="relative w-full h-screen">
        <div className="w-full h-screen absolute grid place-items-center top-0 left-0 z-0"
          style={{
            clip: "rect(0, auto, auto, 0)",
          }}
        >
          <div
            className="fixed inset-0 w-full h-full flex items-center justify-center bg-no-repeat bg-cover bg-center -z-10
                before:content-[''] before:fixed before:inset-0 before:opacity-60 before:z-10 before:bg-black
                bg-[url('/assets/Home/hero/bg2.webp')]"
            ref={(el) => { if (el) scrollWatcherRef.current[0] = el; }}
          >
          </div>
          <div className="fixed w-full z-10 flex items-center justify-center gap-5">
            <div
              className="absolute text-[3.5rem] md:text-[5rem] lg:text-[7.5rem] font-black
                text-center text-transparent [-webkit-text-stroke:2px_var(--primary)]
                md:[-webkit-text-stroke:5px_var(--primary)]"
            >
              <p
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%]"
                ref={(el) => { if (el) headingRefs.current[0] = el; }}
              >
                Welcome
              </p>
              <p
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50%]"
                ref={(el) => { if (el) headingRefs.current[1] = el; }}
              >
                To
              </p>
              <p
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[50%]"
                ref={(el) => { if (el) headingRefs.current[2] = el; }}
              >
                Tulunadu
              </p>
            </div>
            <SVGHeader2 ref={svgRef} />
          </div>
        </div>
      </div>

      <div className="relative w-full h-[700vh]">
        <div className="absolute w-full h-full top-0 left-0"
          style={{
            clip: "rect(0, auto, auto, 0)",
          }}
          ref={(el) => { if (el) scrollWatcherRef.current[1] = el }}
        >
          <img
            className="fixed top-0 w-full h-full object-cover z-40"
            src="/assets/Home/hero/foliage.png" alt="foliage"
            ref={(el) => { if (el) foliageRefs.current[0] = el; }}
          />
          <div
            className="fixed top-0 w-full h-full bg-black/50 z-10"
            ref={overlayRef}
          ></div>
          <div
            className="fixed w-full text-wrap text-[2.5rem] md:text-[5rem] lg:text-[7.5rem] 
                font-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              text-primary text-center z-30"
            style={{
              textShadow: '7px 7px 10px black'
            }}
            ref={(el) => { if (el) headingRefs.current[3] = el; }}
          >
            <p>From The</p>
            <p>Western Ghats</p>
          </div>
          <img
            className="fixed top-0 left-0 w-full h-full object-cover object-center bg-white z-0"
            src="/assets/Home/hero/mountain.png"
            alt="western ghats"
            ref={(el) => { if (el) imgRefs.current[0] = el; }}
          />
          <img
            className="fixed top-0 left-0 w-full h-full object-cover object-center bg-white z-0"
            src="/assets/Home/hero/bg1.webp"
            alt="eastern coast"
            ref={(el) => { if (el) imgRefs.current[1] = el; }}
          />
          <div
            className="fixed w-full text-[2.5rem] md:text-[5rem] lg:text-[7.5rem] 
              font-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              text-primary text-center z-30"
            style={{
              textShadow: '7px 7px 10px black'
            }}
            ref={(el) => { if (el) headingRefs.current[4] = el; }}
          >
            <p>To The</p>
            <p>Eastern Coast</p>
          </div>
          <img
            className="fixed top-0 w-full h-full object-cover z-40 opacity-0 scale-[2]"
            src="/assets/Home/hero/foliage.png" alt="foliage"
            ref={(el) => { if (el) foliageRefs.current[1] = el; }}
          />
          <img
            className="fixed top-0 w-full h-full object-cover z-0"
            src="/assets/Home/hero/dasara.jpg" alt=""
            ref={(el) => { if (el) imgRefs.current[2] = el; }}
          />
          <div
            className="fixed w-full h-full text-[2.5rem] md:text-[5rem] lg:text-[7.5rem] 
              top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center
              flex-col text-primary text-center z-10 font-black"
            style={{
              textShadow: '7px 7px 10px black'
            }}
            ref={(el) => { if (el) headingRefs.current[5] = el; }}
          >
            <p>Enter The</p>
            <p>Sacred Realm</p>
          </div>
        </div>
      </div>

      <div
        className="map w-full min-h-screen flex flex-col lg:flex-row gap-8 items-center justify-center p-10 lg:px-20"
        ref={(el) => { if (el) scrollWatcherRef.current[2] = el }}>
        <div
          className="w-full lg:w-1/2 flex items-center justify-center text-center"
          ref={(el) => { if (el) headingRefs.current[6] = el }}
        >
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight
                text-transparent bg-clip-text bg-linear-to-r from-primary via-amber-400 to-primary
                leading-tight">
              The Spiritual Hub
            </h2>
            <p className="text-white/60 text-base md:text-lg lg:text-xl max-w-lg">
              Spread across two states and three districts — Udupi, Dakshina Kannada & Kasaragod
            </p>
          </div>
        </div>
        <div className="w-full lg:w-2/3 xl:w-1/2 h-100 lg:h-125">
          <MAP minimal ref={mapRef}>
            <Marker position={[13.3409, 74.7421]}>
              <Popup>Udupi - The Heart of Tulunadu</Popup>
            </Marker>
            <Marker position={[12.8701, 74.8419]}>
              <Popup>Mangaluru - The Heart of Tulunadu</Popup>
            </Marker>
            <Marker position={[12.4996, 74.9869]}>
              <Popup>Kasargod - The Heart of Tulunadu</Popup>
            </Marker>
          </MAP>
        </div>
      </div>

      <div
        className="cultures w-full h-[200vh] flex flex-col gap-10 items-center justify-center"
        ref={(el) => { if (el) scrollWatcherRef.current[3] = el }}
      >
        <div ref={(el) => { if (el) headingRefs.current[7] = el }}>
          <SectionHeading>Cultures And Traditions</SectionHeading>
        </div>

        <div className="w-screen h-1/2 md:h-screen relative flex">
          <div className="absolute top-0 w-screen h-full z-10 bg-black" ref={swiperOverlayRef}></div>

          <Swiper
            className="absolute top-0 z-0 w-screen h-full"
            spaceBetween={50}
            slidesPerView={1}
            loop={swiperData.length > 1}
            autoplay={{ delay: 10000 }}
            keyboard={{ enabled: true, onlyInViewport: true }}
            pagination={{
              clickable: true,
              type: "bullets",
              el: ".custom-pagination",
              bulletClass: "w-2 h-2 bg-white/40 z-10 transition-all duration-300 rounded-full",
              bulletActiveClass: "w-8 !bg-primary rounded-full"
            }}
            navigation={{
              nextEl: ".custom-nav-next",
              prevEl: ".custom-nav-prev"
            }}
            modules={[Pagination, Navigation, Keyboard, EffectCoverflow, Autoplay]}
            effect="coverflow"
          >
            {
              swiperData && swiperData.map((slide, index) => (
                <SwiperSlide key={index}>
                  <div className="z-0 relative w-full h-full lg:flex-row flex flex-col-reverse justify-center
                                    lg:justify-around items-center md:p-5">
                    <div className="lg:w-1/3 md:w-5/6 w-full lg:h-full h-1/3 flex flex-col items-center md:justify-center md:gap-5">
                      <h1 className="text-2xl lg:text-4xl font-black text-transparent 
                        bg-clip-text bg-linear-to-r from-primary to-amber-400">
                        {slide.title}
                      </h1>
                      <p className="text-justify hidden md:block text-white/60 text-sm md:text-base p-6 lg:p-10 leading-relaxed">
                        {slide.descr}
                      </p>
                      <Button content="Explore" onClick={() => navigate(`/explore/${slide.title}`)} />
                    </div>
                    <div
                      className="flex lg:flex-col items-center justify-center lg:w-2/5 lg:h-full w-screen h-[65%]
                        cursor-pointer"
                      onMouseEnter={() => setHovering(true)}
                      onClick={() => setHovering(!isHovering)}
                      onMouseLeave={() => setHovering(false)}
                    >
                      <img
                        loading="lazy"
                        className={`relative lg:w-3/5 md:w-[40%] w-[60%] aspect-video object-cover z-0 
                            rounded-lg shadow-xl transition-all duration-500
                            ${isHovering ?
                            "lg:translate-y-0 lg:-rotate-12 lg:translate-x-0 -translate-y-28 -rotate-20 translate-x-[90%] " :
                            "-translate-y-5 rotate-10 translate-x-[90%] lg:translate-x-0 lg:translate-24 lg:rotate-12"
                          }`}
                        src={slide.images[0]}
                        alt={slide.title}
                      />
                      <img
                        loading="lazy"
                        className={`relative lg:w-3/5 md:w-[40%] w-[60%] aspect-video object-cover z-10 
                            rounded-lg shadow-2xl`}
                        src={slide.images[1]}
                        alt={slide.title}
                      />
                      <img
                        loading="lazy"
                        className={`relative lg:w-3/5 md:w-[40%] w-[60%] aspect-video object-cover z-0 
                            rounded-lg shadow-xl transition-all duration-500
                            ${isHovering ?
                            "lg:translate-y-0 lg:-rotate-12 translate-y-28 -translate-x-[90%] -rotate-20 lg:translate-x-0" :
                            "translate-y-5 rotate-10 -translate-x-[90%] lg:translate-x-0 lg:-translate-y-24 lg:rotate-12"
                          }`}
                        src={slide.images[2]}
                        alt={slide.title}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))
            }

            <div className="flex relative bottom-20 md:bottom-16 gap-3 flex-col-reverse">
              <div className="nav w-full text-black flex items-center justify-center gap-2 text-3xl">
                <div className="custom-nav-prev z-10 cursor-pointer rounded-[999px] bg-white hover:bg-primary">
                  <GrFormPreviousLink />
                </div>
                <div className="custom-nav-next z-10 cursor-pointer rounded-[9999px] bg-white hover:bg-primary">
                  <GrFormNextLink />
                </div>
              </div>
              <div className="custom-pagination w-full h-auto flex items-center justify-center gap-2">
              </div>
            </div>
          </Swiper>
        </div>

      </div>

      {
        recentPosts.length > 0 &&
        <div
          className="recent w-screen min-h-screen flex flex-col items-center justify-center py-20"
          ref={(el) => { if (el) scrollWatcherRef.current[4] = el }}
        >
          <div ref={(el) => { if (el) headingRefs.current[8] = el }}>
            <SectionHeading>Recent Posts</SectionHeading>
          </div>
          <div
            className="w-full max-w-7xl flex flex-wrap items-stretch justify-center gap-6 px-6"
          >
            {
              recentPosts.length > 0 && recentPosts.map((post, id) => (
                <div
                  className="w-full sm:w-[45%] lg:w-[30%]"
                  key={id}
                  ref={(el) => {
                    if (el)
                      recentPostRefs.current[id] = el
                  }}
                >
                  <PostCard {...post} />
                </div>
              ))
            }
            {recentPosts.length === 0 && (
              <p className="text-white/40 text-lg">No posts yet</p>
            )}
          </div>
        </div>
      }

      {
        upcomingEvents.length > 0 &&
        <div
          className='w-screen flex flex-col items-center justify-start gap-20 py-20 px-6'
          ref={(el) => { if (el) scrollWatcherRef.current[5] = el; }}
          style={{
            minHeight: `${upcomingEvents.length * 100}vh`
          }}
        >
          <div ref={(el) => { if (el) headingRefs.current[9] = el; }}>
            <SectionHeading>Upcoming Events</SectionHeading>
          </div>

          <div
            className='relative flex flex-col w-full max-w-5xl mx-auto'
            style={{
              justifyContent: upcomingEvents.length > 1 ? 'space-between' : 'center',
              minHeight: upcomingEvents.length > 0 ? `${upcomingEvents.length * 200}px` : 'auto'
            }}
          >
            <div
              ref={upcomingEventsLineRef}
              className='w-0.5 bg-linear-to-b from-primary via-amber-400 to-primary origin-top 
                absolute left-1/2 -translate-x-1/2 top-0 bottom-0'
            />

            {
              upcomingEvents.length > 0 && upcomingEvents.map((item, id) => (
                <div
                  key={id}
                  className='w-1/2 items-center flex justify-end'
                  ref={(el) => {
                    if (el) upcomingEventRefs.current[id] = el;
                  }}
                  style={{
                    flexDirection: id % 2 === 0 ? 'row' : 'row-reverse',
                    margin: id % 2 === 0 ? '0 auto 0 0' : '0 0 0 auto'
                  }}
                >
                  <div
                    className="w-1/2 flex flex-col items-center justify-center gap-2"
                  >
                    <img
                      className="rounded-lg shadow-xl w-full max-w-50 aspect-square object-cover"
                      src={`${BASE_URL}${item?.coverImage as string}`}
                      alt="event"
                    />
                    <div className="text-center">
                      <p className="text-transparent bg-clip-text bg-linear-to-r from-primary to-amber-400 font-bold text-lg">{item.title}</p>
                      <div className="flex items-center justify-center gap-1.5 text-white/50 text-sm mt-1">
                        <FaRegCalendar className="text-primary/60" />
                        <span>
                          {
                            new Date(item?.duration?.start ?? "").toLocaleDateString(
                              'en-IN',
                              { month: 'short', day: 'numeric' }
                            )
                          }
                          -
                          {
                            new Date(item?.duration?.end ?? "").toLocaleDateString(
                              'en-IN',
                              { month: 'short', day: 'numeric', year: 'numeric' }
                            )
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="h-0.5 w-1/4 bg-linear-to-r from-primary/60 to-primary" />
                </div>
              ))}
            {upcomingEvents.length === 0 && (
              <p className="text-white/40 text-lg text-center">No upcoming events</p>
            )}
          </div>
        </div>
      }

      <div
        className='cta relative w-screen h-[350vh] mt-[50vh] mb-[50vh] transition-all'
        ref={(el) => {
          if (el) scrollWatcherRef.current[6] = el
        }}
      >
        <div className="sticky top-0 w-full h-screen">
          <div className="overlay w-full h-screen absolute top-0 bg-black/60 z-10"></div>
          <div 
            className="w-screen h-1/4 md:w-1/4 md:h-screen top-0 left-0 absolute
              bg-[url('/assets/Home/cta/daivaradhane.jpg')] bg-no-repeat
              bg-cover bg-center transition-all duration-300"
            ref={(el) => { if (el) bgRefs.current[0] = el }}></div>
          <div 
            className="w-screen h-1/4 md:w-1/2 md:h-screen top-[25%] md:top-0 md:left-[12.5%] absolute
              bg-[url('/assets/Home/cta/Kambala.webp')] bg-no-repeat
              bg-cover bg-center transition-all duration-300"
            ref={(el) => { if (el) bgRefs.current[1] = el }}></div>
          <div 
            className="w-screen h-1/4 md:w-1/2 md:h-screen bottom-[25%] md:top-0 md:right-[12.5%] absolute
              bg-[url('/assets/Home/cta/yakshagana.jpg')] bg-no-repeat
              bg-cover md:bg-center transition-all duration-300"
            ref={(el) => { if (el) bgRefs.current[2] = el }}></div>
          <div 
            className="w-screen h-1/4 md:w-1/4 md:h-screen bottom-0 right-0 absolute
              bg-[url('/assets/Home/cta/nagaradhane.jpg')] bg-no-repeat
              bg-cover bg-center md:bg-position-[40%] transition-all duration-300"
            ref={(el) => { if (el) bgRefs.current[3] = el }}></div>
        </div>
        <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center gap-6 text-center z-20 p-5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {
              state.token ?
                "Embrace The Land of Faith"
                :
                "Fully Experience The World Of Faith"
            }
          </h1>
          <div className="flex items-center justify-center gap-3 w-1/2">
            <div className="flex-1 h-px bg-linear-to-r from-transparent to-primary/60" />
            <span className="text-primary/80 font-bold drop-shadow-[0_0_8px_rgba(232,129,54,0.4)]">ॐ</span>
            <div className="flex-1 h-px bg-linear-to-l from-transparent to-primary/60" />
          </div>
          {
            state.token ?
              <Button
                content="Go To Dashboard"
                onClick={() => navigate("/dashboard")}
              />
              :
              <Button
                content="Get Started"
                onClick={() => navigate("/signup")}
              />
          }
        </div>
      </div>

      <div className="quote w-fit ml-auto mr-auto pb-[75vh] text-center">
        <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-cursive
            text-transparent bg-clip-text bg-linear-to-r from-white via-primary to-white">
          "Tuluva Manna Satyole Chitta"
        </h1>
        <p className="md:text-right text-center font-cursive text-white/50 mt-2">- Vijeth M Shetty Manjanady</p>
      </div>

    </div>
  )
}

export default Home;