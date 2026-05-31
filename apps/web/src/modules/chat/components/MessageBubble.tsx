import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isSender: boolean;
}

export function MessageBubble({ message, isSender }: MessageBubbleProps) {
  const createdAt =
    typeof message.createdAt === "string"
      ? new Date(message.createdAt)
      : message.createdAt;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        isSender ? "items-end self-end" : "items-start self-start"
      )}
    >
      <div
        className={cn(
          "px-4 py-2 rounded-2xl text-sm leading-relaxed",
          isSender
            ? "bg-violet-600 text-white rounded-br-sm"
            : "bg-neutral-800 text-neutral-100 rounded-bl-sm"
        )}
      >
        {message.body}
      </div>
      <span className="text-[11px] text-muted-foreground px-1">
        {format(createdAt, "HH:mm")}
      </span>
    </div>
  );
}

