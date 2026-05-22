import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import { marked } from "marked";
import api from "../api/client";

marked.setOptions({ breaks: true });

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

export default function ChatBot({ title = "Asistente IA", placeholder, contextHtml = "" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/chat/", {
        messages: nextMessages,
        context: contextHtml ? stripHtml(contextHtml) : "",
      });
      setMessages((prev) => [...prev, { role: "model", content: res.data.reply }]);
    } catch (err) {
      const msg = err.response?.data?.error || "Error al conectar con el asistente.";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const defaultPlaceholder =
    placeholder ||
    (contextHtml
      ? "Pregunta algo sobre esta publicación..."
      : "¿Cómo puedo usar IA para personalizar el aprendizaje?");

  return (
    <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-mariner-100 dark:border-zinc-800">
        <div className="w-7 h-7 rounded-full bg-mariner-100 dark:bg-zinc-800 flex items-center justify-center flex-none">
          <Sparkles size={14} className="text-mariner-600 dark:text-zinc-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-mariner-900 dark:text-zinc-100">{title}</h2>
          {contextHtml && (
            <p className="text-xs text-mariner-400 dark:text-zinc-500">Con contexto de esta publicación</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 px-4 py-4 min-h-[180px] max-h-[380px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Bot size={28} className="text-mariner-300 dark:text-zinc-600" />
            <p className="text-sm text-mariner-400 dark:text-zinc-500 max-w-xs">
              {contextHtml
                ? "Hazme preguntas sobre el contenido de esta publicación."
                : "Soy tu asistente de IA educativa. ¿En qué te puedo ayudar?"}
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-mariner-600 dark:bg-mariner-500 text-white rounded-br-sm whitespace-pre-wrap"
                  : "bg-mariner-50 dark:bg-zinc-800 text-mariner-800 dark:text-zinc-100 rounded-bl-sm border border-mariner-100 dark:border-zinc-700 chat-markdown"
              }`}
            >
              {m.role === "user" ? (
                m.content
              ) : (
                <span dangerouslySetInnerHTML={{ __html: marked.parse(m.content) }} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-mariner-50 dark:bg-zinc-800 border border-mariner-100 dark:border-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-mariner-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-mariner-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-mariner-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 px-5 pb-1">{error}</p>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 px-4 py-3 border-t border-mariner-100 dark:border-zinc-800"
      >
        <input
          ref={inputRef}
          className="flex-1 px-3 py-2 border border-mariner-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 text-sm transition-colors"
          placeholder={defaultPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center justify-center w-9 h-9 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-none"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
