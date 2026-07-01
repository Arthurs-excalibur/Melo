import { AlertCircle, RefreshCw } from "lucide-react";
import { FadeIn } from "@/components/animations/Wrappers";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = "Something went wrong", message, onRetry, className = "" }: ErrorStateProps) {
  return (
    <FadeIn className={`flex flex-col items-center justify-center space-y-6 min-h-[50vh] text-center p-6 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center relative z-10">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-2xl font-heading font-bold text-white">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-white/90"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Analysis
        </button>
      )}
    </FadeIn>
  );
}
