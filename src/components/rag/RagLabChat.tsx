import { useEffect, useRef, useState } from "react";
import { ChatIcon, CompareIcon, PaperPlaneIcon } from "../../icons";
import { runComparison, exampleQueries } from "../../services/compare";
import type { ChatSource, ComparisonResult } from "../../lib/types";
import ComparisonSummary from "./ComparisonSummary";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  result?: ComparisonResult;
};

let messageCounter = 0;

function GroundedBadge({ groundedness }: { groundedness: string }) {
  const color =
    groundedness === "High"
      ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
      : groundedness === "Medium"
        ? "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
        : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color}`}
    >
      Grounded: {groundedness}
    </span>
  );
}

function SourceChips({ sources }: { sources: ChatSource[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {sources.map((source, index) => (
        <span
          key={`${source.document}-${source.section ?? index}`}
          className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          {source.document}
          {source.section && (
            <span className="text-gray-400 dark:text-gray-500">· {source.section}</span>
          )}
          {source.score != null && (
            <span className="font-mono text-brand-600 dark:text-brand-400">
              {Math.round(source.score * 100)}%
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function AnswerCard({ answer, isRag }: { answer: ComparisonResult["rag"]; isRag: boolean }) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              isRag ? "bg-brand-50 dark:bg-brand-500/15" : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <CompareIcon
              className={`size-4 ${isRag ? "text-brand-500 dark:text-brand-400" : "text-gray-400 dark:text-gray-500"}`}
            />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {answer.label}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {answer.model}
            </p>
          </div>
        </div>
        <GroundedBadge groundedness={answer.groundedness} />
      </div>

      <div className="flex-1 px-4 py-3">
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {answer.answer}
        </p>
      </div>

      <div className="border-t border-gray-200 px-4 py-2.5 dark:border-gray-800">
        {isRag ? (
          answer.sources.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                Retrieved chunks:
              </span>
              <SourceChips sources={answer.sources} />
            </div>
          ) : (
            <p className="text-[11px] text-error-500 dark:text-error-400">
              No chunks above the similarity threshold — there is no evidence behind this answer.
            </p>
          )
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              Whole document(s) stuffed into the prompt:
            </span>
            {answer.sources.length > 0 ? (
              <SourceChips sources={answer.sources} />
            ) : (
              <span className="text-[11px] text-gray-500 dark:text-gray-400">no documents</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RagLabChat({
  onResult,
  selectedIds,
}: {
  onResult?: (result: ComparisonResult) => void;
  selectedIds: string[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || busy) return;
    if (selectedIds.length === 0) return;

    const userMessage: Message = {
      id: ++messageCounter,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setBusy(true);

    try {
      const result = await runComparison(text, selectedIds);
      const assistantMessage: Message = {
        id: ++messageCounter,
        role: "assistant",
        text: text,
        result,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      onResult?.(result);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Something went wrong.";
      const isRateLimit =
        /503|UNAVAILABLE|high demand|All LLM providers failed/i.test(raw);
      const assistantMessage: Message = {
        id: ++messageCounter,
        role: "assistant",
        text: isRateLimit
          ? "The AI service is temporarily overloaded. Please try again in a moment."
          : raw,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-[720px] flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
          <ChatIcon className="size-5 text-brand-500 dark:text-brand-400" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Ask your documents
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            RAG retrieves the relevant chunks; the full-doc baseline stuffs the
            whole corpus into one prompt
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar sm:px-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <ChatIcon className="size-7 text-gray-400 dark:text-gray-500" />
            </span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Start a comparison
              </p>
              <p className="mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                Ask a question or pick an example below. You{"'"}ll see RAG vs
                full-doc side by side, plus live metrics on the right.
              </p>
            </div>
            {selectedIds.length === 0 && (
              <p className="text-xs text-warning-600 dark:text-warning-400">
                Select at least one document to run a comparison.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-500 px-4 py-3 text-sm text-white">
                      {message.text}
                    </div>
                  </div>
                )}
                {message.result ? (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <AnswerCard answer={message.result.rag} isRag />
                      <AnswerCard answer={message.result.baseline} isRag={false} />
                    </div>
                    <ComparisonSummary result={message.result} />
                  </div>
                ) : message.role === "assistant" ? (
                  <div className="mt-3 flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                      {message.text}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 text-sm text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                  Comparing RAG vs baseline...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Try:
          </span>
          {exampleQueries.map((example) => (
            <button
              key={example}
              onClick={() => sendMessage(example)}
              disabled={busy || selectedIds.length === 0}
              className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 dark:border-gray-800 dark:text-gray-400 dark:hover:border-brand-700 dark:hover:text-brand-400 dark:disabled:hover:border-gray-800 dark:disabled:hover:text-gray-400"
            >
              {example}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder={
              selectedIds.length === 0
                ? "Select a document to start asking..."
                : "Ask a question about your documents..."
            }
            disabled={selectedIds.length === 0}
            className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || busy || selectedIds.length === 0}
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
