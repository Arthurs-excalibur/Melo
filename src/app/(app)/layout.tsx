import { Navbar } from "@/components/layout/Navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative z-10 min-h-screen w-full text-white selection:bg-mood-purple/30 pb-24 flex flex-col items-center overflow-x-hidden">
        <Navbar />
        {children}
      </div>
    </>
  );
}
