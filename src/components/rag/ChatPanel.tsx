import { useEffect, useRef, useState } from "react";
import { ChatIcon, PaperPlaneIcon } from "../../icons";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const sampleReply = (indexedCount: number) => {
  if (indexedCount === 0) {
    return "No documents are indexed yet. Upload a source on the left panel first, then I can answer questions about it.";
  }
  return `Found it. I searched the ${indexedCount} indexed document${indexedCount > 1 ? "s" : ""} and retrieved the most relevant chunks to answer your question. This is a simulated response - wire the chat to your RAG backend to get real answers.`;
};

let messageCounter = 0;

export default function ChatPanel({ indexedCount }: { indexedCount: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: ++messageCounter,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const assistantMessage: Message = {
        id: ++messageCounter,
        role: "assistant",
        text: sampleReply(indexedCount),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 800);
  };

  return (
    <div className="flex h-[560px] flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
          <ChatIcon className="size-5 text-brand-500 dark:text-brand-400" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Test your RAG
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ask questions against your indexed documents
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <ChatIcon className="size-7 text-gray-400 dark:text-gray-500" />
            </span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Start a conversation
              </p>
              <p className="mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                Type a question about the documents you uploaded on the left.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "rounded-br-sm bg-brand-500 text-white"
                      : "rounded-bl-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800 sm:px-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask a question about your documents..."
            className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperPlaneIcon className="size-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}