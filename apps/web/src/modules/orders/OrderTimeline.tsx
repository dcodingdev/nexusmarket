"use client";

import { cn } from "@/lib/utils";

const STATUS_STAGES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

interface OrderTimelineProps {
  status: string;
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const currentStageIndex = STATUS_STAGES.indexOf(status);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500" 
          style={{ width: `${(Math.max(0, currentStageIndex) / (STATUS_STAGES.length - 1)) * 100}%` }}
        />

        {STATUS_STAGES.map((stage, index) => {
          const isActive = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;

          return (
            <div key={stage} className="flex flex-col items-center relative z-10">
              <div 
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-colors duration-300",
                  isActive ? "bg-primary border-primary" : "bg-background border-muted",
                  isCurrent && "ring-4 ring-primary/20"
                )} 
              />
              <span 
                className={cn(
                  "mt-2 text-[10px] font-medium uppercase tracking-wider",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
