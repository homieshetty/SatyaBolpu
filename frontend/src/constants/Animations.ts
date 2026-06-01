export type PropsType = {
  name: string,
  ref: GSAPTweenTarget;
  fromVars: GSAPTweenVars;
  toVars: GSAPTweenVars;
};

const initalDesktopClipPaths = [
  "polygon(0% 100%,50% 100%,50% 100%,0% 100%)",
  "polygon(25% 0%,100% 0%,75% 0%,25% 0%)",
  "polygon(25% 100%,75% 100%,75% 100%,0% 100%)",
  "polygon(50% 0%,100% 0%,100% 0%,50% 0%)"
];
const finalDesktopClipPaths = [
  "polygon(0% 0%,100% 0%,50% 100%,0% 100%)",
  "polygon(25% 0%,100% 0%,50% 100%,0% 100%)",
  "polygon(50% 0%,100% 0%,75% 100%,0% 100%)",
  "polygon(50% 0%,100% 0%,100% 100%,0% 100%)"
];
const initalMobileClipPaths = [
  "inset(0% 100% 0% 0%)",
  "inset(0% 0% 0% 100%)",
  "inset(0% 100% 0% 0%)",
  "inset(0% 0% 0% 100%)"
];
const finalMobileClipPaths = [
  "inset(0% 0% 0% 0%)",
  "inset(0% 0% 0% 0%)",
  "inset(0% 0% 0% 0%)",
  "inset(0% 0% 0% 0%)"
];

export const buildAnimationProps = (
  scrollWatcherRef: React.RefObject<HTMLDivElement[]>,
  headingRefs: React.RefObject<HTMLDivElement[]>,
  foliageRefs: React.RefObject<HTMLImageElement[]>,
  overlayRef: React.RefObject<HTMLDivElement | null>,
  imgRefs: React.RefObject<HTMLImageElement[]>,
  svgRef: React.RefObject<SVGSVGElement | null>,
  mapRef: React.RefObject<HTMLDivElement | null>,
  swiperOverlayRef: React.RefObject<HTMLDivElement | null>,
  recentPostRefs: React.RefObject<HTMLDivElement[]>,
  upcomingEventsLineRef: React.RefObject<HTMLDivElement | null>,
  upcomingEventRefs: React.RefObject<HTMLDivElement[]>,
  bgRefs: React.RefObject<HTMLDivElement[]>,
  buttonRefs: React.RefObject<HTMLButtonElement[]>,
  isMobile: boolean
): PropsType[] => {

  const upcomingEventRefsAnimations: PropsType[] = upcomingEventRefs.current.map((ref, index) => ({
    name: `upcoming-event-${index}`,
    ref,
    fromVars: {
      clipPath: "inset(0% 0% 0% 100%)",
    },
    toVars: {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: 'none',
      scrollTrigger: {
        trigger: ref,
        scrub: true,
        start: '-10% center',
        end: 'center center',
        toggleActions: 'play none none reverse'
      }
    }
  }))

  return [
    {
      name: 'heading-(1,2,3)',
      ref: headingRefs.current.slice(0, 3),
      fromVars: {
        opacity: 0 
      },
      toVars: { 
        opacity: 1, 
        stagger: 1, 
        duration: 2, 
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[0], 
          start: "-10px top" 
        } 
      }
    },
    {
      name: 'heading-(1,2)',
      ref: headingRefs.current.slice(0, 2),
      fromVars: {  },
      toVars: { 
        opacity: 0, 
        delay: 3.5, 
        duration: 2, 
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[0], 
          start: "-10px top" 
        } 
      }
    },
    {
      name: 'heading-3',
      ref: headingRefs.current[2],
      fromVars: {  },
      toVars: { 
        translateY: "-60%", 
        delay: 3.5, 
        duration: 2, 
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[0], 
          start: "-10px top"
        } 
      }
    },
    { 
      name: 'svg',
      ref: svgRef.current, 
      fromVars: { 
        strokeDashoffset: 400 
      }, 
      toVars: { 
        strokeDashoffset: 0, 
        duration: 2, 
        delay: 4, 
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[0], 
          start: "-10px top" 
        } 
      } 
    },
    { 
      name: 'foliage-1',
      ref: foliageRefs.current[0], 
      fromVars: { 
        scale: 1 
      }, 
      toVars: { 
        scale: 2, 
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "5% top", 
          end: "20% top", 
          scrub: true
        } 
      } 
    },
    { 
      name: 'overlay-1',
      ref: overlayRef.current, 
      fromVars: {}, 
      toVars: { 
        backgroundColor: "rgba(0,0,0,0)", 
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "5% top", 
          end: "20% top", 
          scrub: true, 
          toggleActions: "play none none reverse"
        } 
      } 
    },
    { 
      name: 'heading-4',
      ref: headingRefs.current[3], 
      fromVars: { 
        opacity: 0 
      }, 
      toVars: { 
        opacity: 1, 
        duration: 0.5,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "15% top",
          toggleActions: "play none none reverse"
        }
      } 
    },
    { 
      name: 'foliage-1',
      ref: foliageRefs.current[0], 
      fromVars: { }, 
      toVars: { 
        opacity: 0,
        duration: 0.5,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "15% top", 
          toggleActions: "play none none reverse"
        } 
      } 
    },
    {
      name: 'img-1',
      ref: imgRefs.current[0],
      fromVars: { 
        clipPath: "inset(0% 0% 0% 0%)" 
      },
      toVars: {  
        clipPath: "inset(0% 100% 0% 0%)",
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1],
          start: "20% top",
          end: "40% top",
          scrub: true,
          toggleActions: "play none none reverse"
        } 
      }
    },
    { 
      name: 'heading-4',
      ref: headingRefs.current[3], 
      fromVars: { 
        clipPath: "inset(0% 0% 0% 0%)"
      }, 
      toVars: { 
        clipPath: "inset(0% 100% 0% 0%)",
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "20% top",
          end: "40% top",
          scrub: true,
          toggleActions: "play none none reverse"
        }
      } 
    },
    {
      name: 'img-2',
      ref: imgRefs.current[1],
      fromVars: { 
        clipPath: "inset(0% 0% 0% 100%)"
      },
      toVars: {  
        clipPath: "inset(0% 0% 0% 0%)" ,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1],
          start: "20% top",
          end: "40% top",
          scrub: true,
          toggleActions: "play none none reverse"
        } 
      }
    },
    { 
      name: 'heading-5',
      ref: headingRefs.current[4], 
      fromVars: { 
        clipPath: "inset(0% 0% 0% 100%)"
      }, 
      toVars: { 
        clipPath: "inset(0% 0% 0% 0%)" ,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "20% top",
          end: "40% top",
          scrub: true,
          toggleActions: "play none none reverse"
        }
      } 
    },
    { 
      name: 'foliage-2',
      ref: foliageRefs.current[1], 
      fromVars: { }, 
      toVars: { 
        opacity: 1,
        duration: 0.5,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "45% top",
          toggleActions: "play none none reverse"
        } 
      } 
    },
    { 
      name: 'overlay-2',
      ref: overlayRef.current, 
      fromVars: {}, 
      toVars: { 
        backgroundColor: "rgba(0,0,0,0.5)", 
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1],
          start: "50% top",
          end: "60% top",
          scrub: true, 
          toggleActions: "play none none reverse" 
        } 
      } 
    },
    { 
      name: 'foliage-2',
      ref: foliageRefs.current[1], 
      fromVars: { }, 
      toVars: { 
        scale: 1,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "50% top",
          end: "60% top",
          scrub: true,
          toggleActions: "play none none reverse"
        } 
      } 
    },
    { 
      name: 'heading-5',
      ref: headingRefs.current[4], 
      fromVars: { }, 
      toVars: { 
        opacity: 0,
        duration: 0.5,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "50% top",
          toggleActions: "play none none reverse"
        }
      } 
    },
    {
      name: 'img-2',
      ref: imgRefs.current[1],
      fromVars: { },
      toVars: {  
        clipPath: "inset(0% 0% 100% 0%)" ,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1],
          start: "60% top",
          end: "80% top",
          scrub: true,
          toggleActions: "play none none reverse"
        } 
      }
    },
    { 
      name: 'foliage-2',
      ref: foliageRefs.current[1], 
      fromVars: { }, 
      toVars: { 
        clipPath: "inset(0% 0% 100% 0%)" ,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "60% top",
          end: "80% top",
          scrub: true,
          toggleActions: "play none none reverse"
        } 
      } 
    },
    {
      name: 'img-3',
      ref: imgRefs.current[2],
      fromVars: { 
        clipPath: "inset(100% 0% 0% 0%)"
      },
      toVars: {  
        clipPath: "inset(0% 0% 0% 0%)" ,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1],
          start: "60% top",
          end: "80% top",
          scrub: true,
          toggleActions: "play none none reverse"
        } 
      }
    },
    { 
      name: 'heading-6',
      ref: headingRefs.current[5], 
      fromVars: { 
        clipPath: "inset(100% 0% 0% 0%)"
      }, 
      toVars: { 
        clipPath: "inset(0% 0% 0% 0%)",
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[1], 
          start: "60% top",
          end: "80% top",
          scrub: true,
          toggleActions: "play none none reverse"
        }
      } 
    },
    { 
      name: 'heading-7',
      ref: headingRefs.current[6], 
      fromVars: { 
        opacity: 0
      }, 
      toVars: { 
        opacity: 1,
        duration: 0.5,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[2], 
          start: "-10% top",
        }
      } 
    },
    { 
      name: 'map',
      ref: mapRef.current, 
      fromVars: { 
        height: "0" 
      }, 
      toVars: { 
        height: "100%",
        duration: 0.5, 
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[2],
          start: "-10% top"
        } 
      } 
    },
    { 
      name: 'heading-8',
      ref: headingRefs.current[7], 
      fromVars: { 
        opacity: 0
      }, 
      toVars: { 
        opacity: 1,
        duration: 0.5,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[3], 
          start: "-20% top",
        }
      } 
    },
    { 
      name: 'swiper-overlay',
      ref: swiperOverlayRef.current, 
      fromVars: {
        opacity: 1
      }, 
      toVars: { 
        opacity: 0,
        zIndex: -10,
        duration: 0.5,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[3],
          start: "-10% top",
        } 
      } 
    },
    { 
      name: 'heading-9',
      ref: headingRefs.current[8], 
      fromVars: { 
        opacity: 0
      }, 
      toVars: { 
        opacity: 1,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[4], 
          start: '10% top',
        }
      } 
    },
    ...(recentPostRefs.current.length > 0 
      ? [{
        name: 'recent-posts',
        ref: recentPostRefs.current,
        fromVars: {
          opacity: 0,
          scale: 0.75
        },
        toVars: {
          scale: 1,
          opacity: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: scrollWatcherRef.current[4],
            start: '15% top'
          }
        },
      }] : []
    ),
    { 
      name: 'heading-10',
      ref: headingRefs.current[9], 
      fromVars: { 
        opacity: 0
      }, 
      toVars: { 
        opacity: 1,
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[5], 
          start: '-10% center',
          markers: true
        }
      } 
    },
    {
      name: 'upcoming-events-line',
      ref: upcomingEventsLineRef.current,
      fromVars: {
        scaleY: 0
      },
      toVars: {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: scrollWatcherRef.current[5],
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        }
      }
    },
    ...upcomingEventRefsAnimations,
    // {
    //   ref: buttonRefs.current,
    //   fromVars: {
    //     opacity: 0
    //   },
    //   toVars: {
    //     opacity: 1,
    //     duration: 0.25,
    //     scrollTrigger: {
    //       trigger: buttonRefs.current,
    //       start: "top center",
    //     }
    //   }
    // },
    {
      name: 'cta-bgs',
      ref: bgRefs.current,
      fromVars: {
        clipPath: (index) => isMobile ? initalMobileClipPaths[index] : initalDesktopClipPaths[index]
      },
      toVars: {
        clipPath: (index) => isMobile ? finalMobileClipPaths[index] : finalDesktopClipPaths[index],
          duration: 0.25,
        stagger: 0.1, 
        scrollTrigger: { 
          trigger: scrollWatcherRef.current[6],
          start: 'top top',
          end: 'center top',
          toggleActions: 'play none none reverse'
        }
      }
    }
  ];
};
