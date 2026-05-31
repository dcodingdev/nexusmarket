export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-neutral-800 rounded-2xl rounded-bl-sm w-fit">
      <span
        className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

