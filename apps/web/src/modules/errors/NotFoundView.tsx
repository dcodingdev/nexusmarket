"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundView() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 relative overflow-hidden bg-background">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10 animate-in fade-in-50 slide-in-from-bottom-8 duration-500">
        
        {/* Large stylized 404 number with gradient and glow */}
        <div className="relative inline-block select-none">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150 animate-pulse" />
          <h1 id="error-title-404" className="text-9xl font-black tracking-tighter bg-gradient-to-r from-primary via-violet-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-2xl">
            404
          </h1>
        </div>

        {/* Text descriptions */}
        <div className="space-y-3">
          <h2 id="error-subtitle" className="text-2xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            The page you are looking for doesn't exist, is temporarily unavailable, or has been moved.
          </p>
        </div>

        {/* Dynamic decorative icon */}
        <div className="flex justify-center py-4">
          <div className="rounded-2xl bg-card border shadow-lg p-4 text-primary animate-bounce duration-[3000ms]">
            <HelpCircle className="w-10 h-10 stroke-[1.5]" />
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <Button
            id="btn-go-back"
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 rounded-xl border-border/80 hover:bg-muted/80 flex items-center justify-center gap-2 group transition-all duration-300"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Go Back
          </Button>
          <Link href="/" passHref className="w-full sm:w-auto">
            <Button
              id="btn-go-home"
              className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-primary-foreground rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group transition-all duration-300"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
