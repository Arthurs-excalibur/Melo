"use client";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function Navbar() {
  const pathname = usePathname();
  const isSharePage = pathname?.includes("/share");
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Spotify User";
  const subtitle = session?.user?.email ?? "Spotify Account";
  const imageUrl = session?.user?.image;

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-mood-darkest/70 border-b border-white/5 w-full">
        <div className="flex items-center gap-4">
          {isSharePage ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" aria-label="Go back to Dashboard">
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2 mr-2">
              <Image src="/logo/enhanced.png" alt="Melo Logo" width={32} height={32} className="w-8 h-8 rounded-xl object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
            </Link>
          )}
          <span className="text-xl font-bold font-heading tracking-wide">
            {isSharePage ? "Share Aura" : "Your Mood Space"}
          </span>
        </div>
        
        {!isSharePage && (
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden sm:flex flex-col text-right ml-2">
              <span className="text-sm font-medium">{name}</span>
              <span className="text-xs text-white/50">{subtitle}</span>
            </div>
            <Link href="/settings" className="w-10 h-10 rounded-full bg-gradient-to-tr from-mood-purple to-mood-cyan flex items-center justify-center border-2 border-white/10 overflow-hidden hover:scale-105 transition-transform">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" aria-hidden="true" />
              )}
            </Link>

          </div>
        )}
      </nav>
    </>
  );
}
