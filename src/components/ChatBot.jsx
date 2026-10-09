import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  Bot,
  Sparkles,
  X,
  Send,
  BookOpen,
  Trash2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { sendChatMessage } from "../services/aiService";
import publicationService from "../services/publicationService";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "¡Hola! Soy tu **Tutor Pedagógico IA**. Estoy aquí para ayudarte a integrar la Inteligencia Artificial en tus aulas, resolver dudas didácticas o analizar publicaciones de la comunidad. ¿En qué te puedo colaborar hoy?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [useContext, setUseContext] = useState(true);
  const [activePub, setActivePub] = useState(null);
  const [error, setError] = useState(null);

  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Detectar si la ruta actual es el detalle de una publicación (/publications/:id)
  useEffect(() => {
    const match = location.pathname.match(/^\/publications\/(\d+)$/);
    if (match) {
      const pubId = match[1];
      publicationService
        .getPublicationById(pubId)
        .then((data) => {
          setActivePub({
            id: pubId,
            title: data.title || `Publicación #${pubId}`,
          });
        })
        .catch(() => {
          setActivePub({
            id: pubId,
            title: `Publicación #${pubId}`,
          });
        });
    } else {
      setActivePub(null);
    }
  }, [location.pathname]);

  // Scroll automático al final del chat al llegar nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Autofoco en el input al abrir el chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);

    try {
      // Formatear historial previo para la API
      const historyForApi = newMessages.map((m) => ({
        role: m.role === "model" ? "model" : "user",
        content: m.content,
      }));

      const pubIdToPass = useContext && activePub ? activePub.id : null;

      const data = await sendChatMessage({
        message: trimmed,
        publicationId: pubIdToPass,
        history: historyForApi.slice(0, -1), // excluimos la pregunta actual recién agregada
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: data.response,
          contextUsed: data.context_used,
        },
      ]);
    } catch (err) {
      console.error("Error al obtener respuesta del Tutor IA:", err);
      setError(err.message || "Ocurrió un fallo al comunicar con el Tutor IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "model",
        content:
          "¡Historial reiniciado! Soy tu **Tutor Pedagógico IA**. ¿En qué puedo asistirte ahora?",
      },
    ]);
    setError(null);
  };

  const renderMarkdown = (rawContent) => {
    try {
      const parsedHtml = marked.parse(rawContent || "");
      const cleanHtml = DOMPurify.sanitize(parsedHtml);
      return { __html: cleanHtml };
    } catch {
      return { __html: DOMPurify.sanitize(String(rawContent || "")) };
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Ventana de Chat Emergente */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2.5rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-white dark:bg-zinc-900 border border-mariner-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 mb-3">
          {/* Header del Chat */}
          <div className="p-4 bg-mariner-600 dark:bg-mariner-700 text-white flex items-center justify-between flex-none shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 dark:bg-white/15 rounded-xl backdrop-blur-xs">
                <Bot className="w-5 h-5 text-mariner-100" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Tutor Pedagógico IA
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                </h3>
                <p className="text-[11px] text-mariner-100/90 font-medium">
                  Asistente educativo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Limpiar conversación"
                className="p-1.5 text-mariner-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar chat"
                className="p-1.5 text-mariner-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Indicador visual de Contexto Activo */}
          {activePub && (
            <div className="bg-mariner-50 dark:bg-zinc-800/80 border-b border-mariner-100 dark:border-zinc-700/60 px-3.5 py-2 flex items-center justify-between text-xs flex-none">
              <div className="flex items-center gap-2 text-mariner-900 dark:text-zinc-200 truncate pr-2">
                <BookOpen className="w-4 h-4 text-mariner-600 dark:text-mariner-400 flex-none" />
                <span className="truncate">
                  <strong className="font-semibold">Contexto:</strong>{" "}
                  {activePub.title}
                </span>
              </div>
              <button
                onClick={() => setUseContext(!useContext)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors flex-none ${
                  useContext
                    ? "bg-mariner-600 text-white dark:bg-mariner-500"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                {useContext ? "Activo" : "Inactivo"}
              </button>
            </div>
          )}

          {/* Cuerpo de la Conversación */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-mariner-300 flex items-center justify-center flex-none shadow-xs mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed text-xs shadow-xs ${
                      isUser
                        ? "bg-mariner-600 text-white dark:bg-mariner-600 rounded-tr-xs"
                        : "bg-mariner-50/70 dark:bg-zinc-800/90 text-mariner-950 dark:text-zinc-100 border border-mariner-100/60 dark:border-zinc-700/50 rounded-tl-xs"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div
                        className="prose dark:prose-invert prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-mariner-900 dark:prose-strong:text-white"
                        dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                      />
                    )}

                    {msg.contextUsed && (
                      <div className="mt-2 text-[10px] text-mariner-600 dark:text-mariner-400 font-semibold flex items-center gap-1 pt-1 border-t border-mariner-200/40 dark:border-zinc-700/40">
                        <BookOpen className="w-3 h-3" /> Contexto pedagógico
                        inyectado
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Indicador de Carga / Respuesta en curso */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-mariner-100 dark:bg-zinc-800 text-mariner-700 dark:text-mariner-300 flex items-center justify-center flex-none animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-mariner-50/70 dark:bg-zinc-800/90 border border-mariner-100 dark:border-zinc-700/50 px-4 py-3 rounded-2xl rounded-tl-xs text-mariner-600 dark:text-zinc-300 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-mariner-500 animate-ping" />
                  <span className="text-xs font-medium italic">
                    El Tutor IA está pensando...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-none mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer / Formulario de Envío */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-zinc-900 border-t border-mariner-100 dark:border-zinc-800 flex items-center gap-2 flex-none"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Haz una consulta didáctica o sobre la publicación..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 bg-mariner-50/50 dark:bg-zinc-800/60 border border-mariner-200 dark:border-zinc-700 rounded-xl text-xs text-mariner-950 dark:text-zinc-50 placeholder:text-mariner-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-mariner-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Botón Flotante Principal (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-4 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
        title="Abrir Asistente Tutor IA"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 border-2 border-white dark:border-zinc-950 rounded-full animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
}
