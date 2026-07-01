"use client";

import { useState } from "react";
import { FadeIn, ParallaxLayer } from "@/components/animations/Wrappers";

const ALBUMS = [
  { src: "/albums/bewitched.webp", alt: "Bewitched", rotation: -18, y: 36, zIndexClass: "z-10", embedUrl: "https://open.spotify.com/embed/album/1rpCHilZQkw84A3Y9czvMO?utm_source=generator&si=6af761ab1cd841ce", embedHeight: 352 },
  { src: "/albums/blond.webp", alt: "Blonde", rotation: -10, y: 18, zIndexClass: "z-20", embedUrl: "https://open.spotify.com/embed/album/3mH6qwIy9crq0I9YQbOuDf?utm_source=generator&si=5554f069504741ac", embedHeight: 352 },
  { src: "/albums/damn.webp", alt: "DAMN.", rotation: -3, y: 4, zIndexClass: "z-30", embedUrl: "https://open.spotify.com/embed/album/4eLPsYPBmXABThSJ821sqY?utm_source=generator&si=37da6825b39a4897", embedHeight: 352 },
  { src: "/albums/graduation.webp", alt: "Graduation", rotation: 3, y: 4, zIndexClass: "z-30", embedUrl: "https://open.spotify.com/embed/album/4SZko61aMnmgvNhfhgTuD3?utm_source=generator&si=79cdfb23a7b84916", embedHeight: 352 },
  { src: "/albums/sza.webp", alt: "SZA", rotation: 10, y: 18, zIndexClass: "z-20", embedUrl: "https://open.spotify.com/embed/album/07w0rG5TETcyihsEIZR3qG?utm_source=generator&si=5f8b8490373e4ff4", embedHeight: 352 },
  { src: "/albums/tptb.webp", alt: "To Pimp A Butterfly", rotation: 18, y: 36, zIndexClass: "z-10", embedUrl: "https://open.spotify.com/embed/album/7ycBtnsMtyVbbwTfJwRjSP?utm_source=generator&si=541dfe5d66f342f8", embedHeight: 352 },
];

export function LandingFeatures() {
  const [selectedAlbumEmbed, setSelectedAlbumEmbed] = useState<{ url: string; height: number } | null>(null);

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-24 overflow-visible">
      <ParallaxLayer offset={40}>
        <FadeIn>
          <div className="text-center mb-24 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-semibold tracking-widest uppercase">
              What You Get
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading max-w-3xl mx-auto leading-tight">
              Not just Data. <span className="text-gradient">A place to display and share your Mood</span>
            </h2>
          </div>
        </FadeIn>

        <div className="relative max-w-5xl mx-auto mt-16 pt-10 pb-20">

          {/* Speech Bubbles */}
          <FadeIn delay={0.2}>
            <div className="absolute top-0 left-[15%] md:left-[25%] bg-[#3B82F6] text-white px-4 py-1.5 rounded-2xl text-sm font-bold z-20 shadow-xl transform -rotate-3">
              click me
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#3B82F6] transform rotate-45"></div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="absolute top-0 right-[15%] md:right-[25%] bg-[#10B981] text-white px-4 py-1.5 rounded-2xl text-sm font-bold z-20 shadow-xl transform rotate-3">
              preview album
              <div className="absolute -bottom-1.5 right-1/2 translate-x-1/2 w-3 h-3 bg-[#10B981] transform rotate-45"></div>
            </div>
          </FadeIn>

          {/* Album Cards */}
          <div className="flex justify-center items-center -space-x-4 sm:-space-x-8 md:-space-x-12">
            {ALBUMS.map((album, i) => (
              <div
                key={i}
                onClick={() => {
                  if (album.embedUrl) {
                    setSelectedAlbumEmbed({ url: album.embedUrl, height: album.embedHeight || 152 });
                  }
                }}
                className={`relative w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-8 ${album.zIndexClass} hover:z-50 border border-white/10 bg-white/5 ${album.embedUrl ? 'cursor-pointer' : ''}`}
                style={{
                  transform: `rotate(${album.rotation}deg) translateY(${album.y}px)`
                }}
              >
                <img
                  src={album.src}
                  alt={album.alt}
                  className="w-full h-full object-cover"
                />

                {/* Fallback placeholder text if image fails/is missing */}
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs font-medium text-center p-2 bg-black/40 -z-10">
                  Put {album.alt} Image Here
                </div>
              </div>
            ))}
          </div>

          {/* Spotify Embed Player */}
          <div className={`mt-24 transition-all duration-500 flex justify-center max-w-3xl mx-auto ${selectedAlbumEmbed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            {selectedAlbumEmbed && (
              <iframe
                data-testid="embed-iframe"
                style={{ borderRadius: "12px" }}
                src={selectedAlbumEmbed.url}
                width="100%"
                height={selectedAlbumEmbed.height}
                frameBorder="0"
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            )}
          </div>
        </div>
      </ParallaxLayer>
    </section>
  );
}
