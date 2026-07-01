"use client";

import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Headphones, Music, Mic2, Play, ChevronDown } from "lucide-react";
import { signIn } from "next-auth/react";

// Interface for the props of each individual icon.
interface IconProps {
  id: number;
  icon?: React.ElementType;
  src?: string;
  className: string;
}

function SpotifyCTA({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <button
      onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
      className={`group inline-flex items-center gap-3 rounded-full font-bold cursor-pointer transition-all duration-300
        bg-[#1DB954] hover:bg-[#1ed760] text-black
        shadow-[0_0_30px_rgba(29,185,84,0.35)] hover:shadow-[0_0_50px_rgba(29,185,84,0.55)]
        active:scale-95
        ${size === "lg" ? "h-14 px-8 text-base" : "h-10 px-6 text-sm"}`}
    >
      <svg className={size === "lg" ? "w-5 h-5" : "w-4 h-4"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
      Connect Spotify — It&apos;s Free
    </button>
  );
}

const Icon = ({
  mouseX,
  mouseY,
  iconData,
  index,
}: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  iconData: IconProps;
  index: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  // Motion values for the icon's position, with spring physics for smooth movement
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const [floatDuration] = React.useState(() => 5 + Math.random() * 5);

  React.useEffect(() => {
    const handleMouseMove = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const distance = Math.sqrt(
          Math.pow(mouseX.current - (rect.left + rect.width / 2), 2) +
          Math.pow(mouseY.current - (rect.top + rect.height / 2), 2)
        );

        // If the cursor is close enough, repel the icon
        if (distance < 150) {
          const angle = Math.atan2(
            mouseY.current - (rect.top + rect.height / 2),
            mouseX.current - (rect.left + rect.width / 2)
          );
          // The closer the cursor, the stronger the repulsion
          const force = (1 - distance / 150) * 50;
          x.set(-Math.cos(angle) * force);
          y.set(-Math.sin(angle) * force);
        } else {
          // Return to original position when cursor is away
          x.set(0);
          y.set(0);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y, mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      key={iconData.id}
      style={{
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('absolute', iconData.className)}
    >
      {/* Inner wrapper for the continuous floating animation */}
      <motion.div
        className={`flex items-center justify-center w-16 h-16 md:w-20 md:h-20 ${iconData.src ? 'p-1' : 'p-3'} rounded-3xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden`}
        animate={{
          y: [0, -8, 0, 8, 0],
          x: [0, 6, 0, -6, 0],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      >
        {iconData.src ? (
          <img src={iconData.src} alt="" className="w-full h-full object-cover rounded-[1.25rem] pointer-events-none" />
        ) : iconData.icon ? (
          <iconData.icon className="w-8 h-8 md:w-10 md:h-10 text-white/70" />
        ) : null}
      </motion.div>
    </motion.div>
  );
};

export function LandingHero() {
  const mouseX = React.useRef(0);
  const mouseY = React.useRef(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    mouseX.current = event.clientX;
    mouseY.current = event.clientY;
  };

  const icons: IconProps[] = [
    // Left Side
    { id: 1, src: "/albums/bewitched.webp", className: "hidden md:block top-[18%] left-[8%]" },
    { id: 2, src: "/albums/channel orange.webp", className: "bottom-[15%] md:bottom-[35%] left-[10%] md:left-[24%]" },
    { id: 3, src: "/albums/danielceazar.webp", className: "hidden md:block top-[40%] left-[12%]" },
    { id: 4, icon: Music, className: "bottom-[8%] md:bottom-[12%] left-[32%]" },
    { id: 5, src: "/albums/damn.webp", className: "hidden md:block top-[6%] left-[38%]" },
    { id: 6, src: "/albums/flowerboy.webp", className: "top-[15%] md:top-[58%] left-[4%]" },
    { id: 7, src: "/albums/image 24.webp", className: "hidden md:block top-[25%] left-[18%]" },
    { id: 8, icon: Mic2, className: "top-[20%] md:bottom-[52%] left-[36%]" },
    { id: 9, src: "/albums/blond.webp", className: "hidden md:block bottom-[6%] left-[14%]" },
    { id: 10, src: "/albums/sza.webp", className: "top-[85%] md:top-[78%] left-[10%]" },
    { id: 11, src: "/albums/image 30.webp", className: "hidden md:block bottom-[22%] left-[5%]" },

    // Right Side
    { id: 12, src: "/albums/image 25.webp", className: "hidden md:block top-[32%] right-[10%]" },
    { id: 13, src: "/albums/image 31.webp", className: "bottom-[10%] md:bottom-[18%] right-[38%]" },
    { id: 14, src: "/albums/tptb.webp", className: "hidden md:block top-[14%] right-[22%]" },
    { id: 15, icon: Headphones, className: "top-[12%] md:bottom-[42%] right-[6%]" },
    { id: 16, src: "/albums/image 27.webp", className: "hidden md:block top-[65%] right-[28%]" },
    { id: 17, src: "/albums/tame impala.webp", className: "top-[8%] right-[5%]" },
    { id: 18, src: "/albums/image 28.webp", className: "hidden md:block bottom-[6%] right-[25%]" },
    { id: 19, src: "/albums/graduation.webp", className: "top-[22%] md:top-[50%] right-[12%]" },
    { id: 20, icon: Play, className: "top-[5%] md:bottom-[65%] right-[25%] md:right-[15%]" },
    { id: 21, src: "/albums/image 29.webp", className: "hidden md:block top-[15%] right-[35%]" },
    { id: 22, src: "/albums/image 26.webp", className: "bottom-[18%] md:bottom-[28%] right-[18%]" },


    { id: 23, src: "/albums/image 32.webp", className: "hidden md:block top-[70%] left-[18%]" },
    { id: 24, src: "/albums/image 33.webp", className: "top-[10%] md:bottom-[48%] left-[20%]" },
    { id: 25, src: "/albums/image 34.webp", className: "hidden md:block top-[82%] right-[18%]" },
    { id: 26, src: "/albums/image 36.webp", className: "hidden md:block bottom-[60%] right-[20%]" },
  ];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative z-10 w-full h-[100dvh] md:h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* Container for the background floating icons */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {icons.map((iconData, index) => (
          <Icon
            key={iconData.id}
            mouseX={mouseX}
            mouseY={mouseY}
            iconData={iconData}
            index={index}
          />
        ))}
      </div>

      {/* Container for the foreground content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
        {/* Badge removed as requested */}

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text font-heading leading-tight">
          Your music taste <br className="hidden sm:block" />
          is a <span className="text-gradient">personality.</span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-lg md:text-xl text-white/60 leading-relaxed">
          Connect Spotify. In 30 seconds, AI maps years of listening history into an interactive music universe — your genres, moods, artists, and hidden patterns.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <SpotifyCTA size="lg" />
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 h-14 px-8 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all text-base font-medium bg-white/5 hover:bg-white/8 backdrop-blur-sm"
          >
            <Headphones className="w-4 h-4" />
            See how it works
          </a>
        </div>

        {/* Trust badge strip removed as requested */}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/80"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-sm uppercase tracking-widest font-medium drop-shadow-md">Scroll for more info</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}
