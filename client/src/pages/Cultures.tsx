import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import useApi from "../hooks/useApi";
import { BASE_URL } from "../App";
import { ICulture } from "../types/globals";

gsap.registerPlugin(ScrollTrigger);

const Cultures = () => {
  const culturesApi = useApi("/cultures");
  const [cultures, setCultures] = useState<ICulture[]>([]);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (culturesApi.data) setCultures(culturesApi.data.cultures);
  }, [culturesApi.data]);

  useLayoutEffect(() => {
    if (cultures.length === 0 || cardsRef.current.length === 0) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [cultures]);

  return (
    <div className="w-screen min-h-screen bg-black pt-20 pb-32 flex flex-col items-center gap-10 px-4">
      <div className="w-full flex flex-col justify-center items-center gap-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl text-center font-black tracking-tight
          text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-primary
          whitespace-pre-wrap text-wrap leading-tight">
          Cultures
        </h1>
        <h1 className="absolute text-4xl sm:text-5xl md:text-6xl text-center font-black tracking-tight
          text-primary blur-sm opacity-30 whitespace-pre-wrap text-wrap leading-tight pointer-events-none"
          aria-hidden>
          Cultures
        </h1>
        <div className="flex items-center justify-center gap-3 w-4/5 sm:w-2/3 lg:w-1/2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/60" />
          <span className="text-lg sm:text-xl text-primary/80 font-bold drop-shadow-[0_0_8px_rgba(232,129,54,0.4)]">ॐ</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/60" />
        </div>
        <p className="text-white/40 text-center text-sm sm:text-base mt-2">
          The living traditions of Tulunadu
        </p>
      </div>

      <div className="w-full max-w-5xl flex flex-col gap-8">
        {cultures.length > 0 &&
          cultures.map((culture, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="group relative w-full rounded-2xl overflow-hidden
                border border-white/10 hover:border-primary/30
                transition-all duration-500 cursor-pointer"
              onClick={() => navigate(`/cultures/${culture.title.toLowerCase()}`)}
            >
              <div className="relative w-full aspect-[21/9] overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={`${BASE_URL}${culture.coverImage}`}
                  alt={culture.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col gap-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary
                  group-hover:text-amber-400 transition-colors duration-300">
                  {culture.title}
                </h2>
                <p className="text-white/60 text-sm sm:text-base leading-relaxed line-clamp-2 max-w-2xl">
                  {culture.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-primary text-sm font-semibold
                    group-hover:translate-x-1 transition-transform duration-300">
                    Explore
                  </span>
                  <span className="text-primary text-sm group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {cultures.length === 0 && !culturesApi.loading && (
        <p className="text-white/30 text-lg mt-20">No cultures found</p>
      )}
    </div>
  );
};

export default Cultures;
