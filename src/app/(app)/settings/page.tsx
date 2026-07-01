"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { FadeIn } from "@/components/animations/Wrappers";
import { User, LogOut, Trash2, Loader2, Settings, Palette } from "lucide-react";
import { ThemePanel } from "@/components/layout/ThemeSelector";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);

  const handleDeleteData = async () => {
    if (!confirm("Are you sure you want to delete all your Melo data? This cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      } else {
        alert("Failed to delete account data.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-mood-cyan animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-3xl w-full mx-auto px-6 mt-12 space-y-8">
      <FadeIn delay={0.1}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading">Settings</h1>
            <p className="text-white/60">Manage your profile and data preferences.</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <section className="bg-glass rounded-3xl p-8 border border-white/10 space-y-8">
          {/* Profile Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-mood-cyan" /> Profile
            </h2>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              {session.user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={session.user.image} alt={session.user.name || "User"} className="w-16 h-16 rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-white/50" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{session.user.name}</h3>
                <p className="text-white/50 text-sm">{session.user.email}</p>
                <div className="mt-2 inline-block px-2 py-1 bg-spotify-green/20 text-spotify-green text-xs font-medium rounded">
                  Connected to Spotify
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Theme Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Palette className="w-5 h-5 text-mood-cyan" /> Appearance
              </h2>
              <button
                onClick={() => setIsThemeExpanded(!isThemeExpanded)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl transition-all text-sm font-medium flex items-center gap-2 text-white"
              >
                {isThemeExpanded ? "Hide Themes" : "Show Themes"}
              </button>
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isThemeExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pt-2">
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
                  <ThemePanel className="bg-transparent" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Account Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LogOut className="w-5 h-5 text-mood-pink" /> Account Actions
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 gap-4">
                <div>
                  <h4 className="font-medium text-white">Sign Out</h4>
                  <p className="text-sm text-white/50">Log out of your Melo session on this device.</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium text-sm text-white whitespace-nowrap"
                >
                  Sign Out
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10 gap-4">
                <div>
                  <h4 className="font-medium text-red-400">Delete Account Data</h4>
                  <p className="text-sm text-white/50">Permanently delete your analyses, history, and connected Spotify data from Melo.</p>
                </div>
                <button
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors rounded-xl font-medium text-sm whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Data
                </button>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
    </main>
  );
}
