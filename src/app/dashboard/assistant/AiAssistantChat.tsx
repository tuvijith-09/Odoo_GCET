"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Warehouse,
  Truck,
  Package,
  Coins,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { askAiAssistantAction } from "@/app/actions";
import { AssistantResponse } from "@/lib/aiAssistant";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  data?: AssistantResponse;
}

const SUGGESTED_QUERIES = [
  {
    title: "Show completed deliveries",
    icon: CheckCircle2,
    tag: "Fulfillment",
  },
  {
    title: "Show pending deliveries",
    icon: Truck,
    tag: "Fulfillment",
  },
  {
    title: "Which products need reordering?",
    icon: TrendingDown,
    tag: "Inventory Health",
  },
  {
    title: "How many screws do we have?",
    icon: Package,
    tag: "Stock Lookup",
  },
  {
    title: "Why did stock decrease this month?",
    icon: Package,
    tag: "Audit Trail",
  },
  {
    title: "Which warehouse has the most stock?",
    icon: Warehouse,
    tag: "Locations",
  },
  {
    title: "What is our total inventory valuation?",
    icon: Coins,
    tag: "Financials",
  },
];

function FormattedMessageLine({ line }: { line: string }) {
  if (!line.trim()) return <div className="h-1.5" />;
  if (line.startsWith("### ")) {
    return <h3 className="font-bold text-base text-slate-900 mt-2 mb-1">{line.replace(/^###\s+/, "")}</h3>;
  }
  if (line.startsWith("## ")) {
    return <h2 className="font-bold text-lg text-slate-900 mt-3 mb-1">{line.replace(/^##\s+/, "")}</h2>;
  }
  if (line === "---") {
    return <hr className="my-2.5 border-slate-200" />;
  }

  // Parse inline bolding **text**, italics *text*, and code `text`
  const parts: (string | React.ReactNode)[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="text-slate-700 italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="px-1 py-0.5 rounded bg-slate-200/80 font-mono text-[11px] text-slate-800">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  const isBullet = line.startsWith("•") || line.startsWith("- ");
  const isSubBullet = line.startsWith("  -");

  return (
    <p
      className={`${
        isSubBullet
          ? "pl-5 text-xs text-slate-600 my-0.5"
          : isBullet
          ? "pl-2 font-medium text-slate-800 my-1"
          : "my-1 text-slate-700"
      }`}
    >
      {parts}
    </p>
  );
}

export default function AiAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "ai",
      text: "Hello! I am your **StockSense AI Inventory Assistant**.\n\nI am directly connected to your live SQLite database with real-time cross-check verification. You can ask for completed deliveries, pending shipments, low stock alerts, product quantities, warehouse distributions, or audit trails.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  async function handleSend(queryText: string) {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await askAiAssistantAction(textToSend);
      if (res?.error) {
        toast.error(res.error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: `⚠️ I encountered an error querying the inventory: ${res.error}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else if (res?.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: res.data.answer,
            data: res.data,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error contacting AI assistant.";
      toast.error(message);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="flex flex-col h-[750px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Assistant Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              StockSense AI Assistant
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck size={11} /> Cross-Check Verified
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Natural language inventory intelligence with 100% live database validation
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: "initial",
                sender: "ai",
                text: "Conversation reset. What would you like to inspect in your inventory?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ])
          }
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium transition"
        >
          <RefreshCw size={12} /> Clear Chat
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Sparkles size={13} className="text-indigo-500" /> Suggestions:
        </span>
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q.title)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 font-medium shrink-0 transition shadow-2xs"
          >
            <q.icon size={13} className="text-indigo-500" />
            {q.title}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === "user" ? "ml-auto justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "ai" && (
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-1">
                <Bot size={18} />
              </div>
            )}

            <div
              className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-800 border border-slate-200/80 space-y-3"
              }`}
            >
              {/* Formatted Markdown Display */}
              <div>
                {msg.text.split("\n").map((line, i) => (
                  <FormattedMessageLine key={i} line={line} />
                ))}
              </div>

              {/* Data Cross-Check Audit Badge */}
              {msg.data?.crossCheck && (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span>Live Database Cross-Check: Verified ✓</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 shrink-0">
                      {msg.data.crossCheck.recordsMatched} matched / {msg.data.crossCheck.totalRecordsScanned} scanned
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    <span className="font-semibold text-emerald-800">Filter Criteria:</span>{" "}
                    <code className="bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200 font-mono text-[10px]">
                      {msg.data.crossCheck.matchingCriteria}
                    </code>
                  </p>
                  {msg.data.crossCheck.auditNotes && msg.data.crossCheck.auditNotes.length > 0 && (
                    <div className="pt-1 border-t border-emerald-200/60 space-y-0.5 text-[11px] text-emerald-800/90">
                      {msg.data.crossCheck.auditNotes.map((note, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Data Points Grid */}
              {msg.data?.dataPoints && msg.data.dataPoints.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {msg.data.dataPoints.map((dp, i) => (
                    <div
                      key={i}
                      className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs"
                    >
                      <p className="text-[11px] text-slate-500 font-medium truncate">{dp.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{dp.value}</p>
                      {dp.meta && (
                        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{dp.meta}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Deep-link Action Buttons */}
              {msg.data?.suggestedActions && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                  {msg.data.suggestedActions.map((act, i) => (
                    <Link
                      key={i}
                      href={act.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      {act.label} <ArrowRight size={12} />
                    </Link>
                  ))}
                </div>
              )}

              <span
                className={`text-[10px] block text-right mt-1 ${
                  msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
              </div>
              <span>Cross-checking records with live database ledger...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything: 'Show completed deliveries', 'Show pending deliveries', 'Which products need reordering?'..."
            className="w-full pl-4 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
          >
          </input>
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition shadow-md shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
