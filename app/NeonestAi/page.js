"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import { Bot, Send, Loader2, Baby, Utensils, Clock, Heart, MessageSquare, ThumbsUp, Users, BarChart3, Copy, Mic } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../components/ui/tooltip";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import ReactMarkdown from "react-markdown";
import SpeechRecognition from "../components/SpeechRecognition";
import TextToSpeech from "../components/TextToSpeech";
import { fetchChatHistory, saveChatHistory } from "@/lib/chatService";
import { useAuth } from "../context/AuthContext";
import { useChatStore } from "@/lib/store/chatStore";

const quickQuestions = [
  { icon: Baby, text: "When should my baby start crawling?", color: "pink" },
  { icon: Utensils, text: "How do I introduce solid foods?", color: "purple" },
  { icon: Clock, text: "What's a good sleep schedule for 6 months?", color: "blue" },
  { icon: Heart, text: "Is my baby's crying normal?", color: "green" },
];

const roles = [
  { label: "Pediatrician", value: "pediatrician" },
  { label: "Baby", value: "baby" },
  { label: "Motherly", value: "mother" },
];

export default function NeonestAi() {
  const [showConfirm, setShowConfirm] = useState(false);
  const clearChatHistory = useChatStore((state) => state.clearChatHistory);
  const [role, setRole] = useState("pediatrician");
  const { chatHistory = {}, setChatHistory = () => {}, historyLoaded = {}, resetChatHistoryForRole = () => {} } = useChatStore((state) => state || {});
  const messages = useMemo(() => chatHistory[role] || [], [chatHistory, role]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState(null);

  const [analytics] = useState({
    totalChats: 1247,
    totalMessages: 5832,
    averageResponseTime: 1.2,
    satisfactionRate: 94.5,
    topQuestions: [
      { question: "When should my baby start crawling?", count: 156 },
      { question: "How do I introduce solid foods?", count: 134 },
      { question: "What's a good sleep schedule?", count: 98 },
      { question: "Is my baby's crying normal?", count: 87 },
      { question: "When do babies start teething?", count: 76 },
    ],
  });

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { token } = useAuth();

  const scrollToBottom = () => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  };

  const isUserNearBottom = () => {
    const el = chatContainerRef.current;
    if (el) {
      const threshold = 100;
      return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }
    return true;
  };

  useEffect(() => {
    if (historyLoaded[role]) return;
    const loadHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const messages = await fetchChatHistory(role, token);
        setChatHistory(role, messages);
      } catch (error) {
        setChatHistory(role, []);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    if (token) loadHistory();
  }, [role, token, chatHistory, setChatHistory]);

  useEffect(() => {
    if (messages.length === 0 || isUserNearBottom()) {
      scrollToBottom();
      setShowNewMessageButton(false);
    } else {
      setShowNewMessageButton(true);
    }
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      const el = chatContainerRef.current;
      if (!el) return;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
      setShowNewMessageButton(!atBottom);
    };
    const el = chatContainerRef.current;
    el?.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  // --- HANDLE ROLE SWITCH & AUTO-CLEAR CHAT ---
  const handleRoleChange = (newRole) => {
    resetChatHistoryForRole(newRole); // auto-clear chat for new role
    setRole(newRole);
    setInput("");
    setIsSending(false);
    setTransitionMessage(`Switched to ${roles.find((r) => r.value === newRole)?.label} mode`);
    setTimeout(() => setTransitionMessage(null), 1500);
    scrollToBottom();
  };

  const handleSubmit = async (e = null, customInput = null) => {
    if (e) e.preventDefault();
    const finalInput = customInput !== null ? customInput : input;
    if (!finalInput.trim()) return;

    // Ensure voice is NOT active when sending a message
    console.log("Disabling voice recognition before sending message"); // debug
    setIsListening(false);

    const newMessage = {
        id: Date.now(),
        role: "user",
        content: finalInput,
        createdAt: new Date().toISOString(),
    };
    const updatedMessages = [...messages, newMessage];
    setChatHistory(role, updatedMessages);
    setInput("");
    setIsSending(true);

    console.log("Sending message:", finalInput); // debug

    try {
        const res = await axios.post("/api/chat", {
            messages: updatedMessages,
            role,
        });
        const finalMessages = [...updatedMessages, res.data];
        setChatHistory(role, finalMessages);
        await saveChatHistory(role, finalMessages, token);
        console.log("Received AI response:", res.data); // debug
    } catch (err) {
        const errorMsg = {
            id: Date.now() + 1,
            role: "system",
            content: "Oops! Something went wrong. Please try again.",
            createdAt: new Date().toISOString(),
        };
        setChatHistory(role, [...updatedMessages, errorMsg]);
        console.error("Error sending message:", err); // debug
    } finally {
        setIsSending(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    handleSubmit(null, question);
  };

  const handleSpeechTranscript = (transcript) => {
    console.log("Voice transcript received:", transcript); // debug
    setInput(transcript);
  };

  // Wrapper to allow only "button" source toggles
  const setListeningFromSource = (val, source) => {
    // debug log to trace caller
    console.log("setListeningFromSource called with:", val, source);
    if (source === "button") {
      setIsListening(val);
    } else {
      // If other sources call it without "button", ignore (this preserves Enter behavior)
      console.log("Ignored setIsListening call without 'button' source");
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Failed to copy!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6 space-y-10">
      <Card className="max-w-4xl mx-auto dark:bg-gray-700">
        <CardHeader className="flex justify-between items-center bg-pink-100 dark:bg-pink-500 rounded-t-lg px-6 py-4">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-pink-500 dark:text-pink-900" />
            <CardTitle className="dark:text-gray-300">NeoNest AI Chatbot</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="border px-3 py-1 rounded-md dark:bg-gray-600 dark:text-gray-200 text-sm bg-white cursor-pointer text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                Choose the role you&apos;d like to chat with
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>

        <CardContent className="space-y-6 p-6 relative">
          {transitionMessage && (
            <div className="absolute top-0 left-0 right-0 flex justify-center z-20">
              <span className="bg-pink-200 text-pink-900 dark:text-gray-200 px-6 py-2 rounded-lg shadow-lg font-semibold text-base">{transitionMessage}</span>
            </div>
          )}

          {messages.length === 0 && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-200 mt-2">AI advice is not a substitute for professional medical consultation.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickQuestions.map((q, idx) => (
                  <Button key={idx} onClick={() => handleQuickQuestion(q.text)} variant="outline" className="text-left dark:text-gray-200 justify-start text-sm">
                    <q.icon className={`w-4 h-4 mr-2 text-${q.color}-500`} />
                    {q.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isHistoryLoading ? (
            <div className="space-y-4 max-h-[600px] min-h-[500px] overflow-y-auto pr-2 py-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"} animate-pulse`}>
                  <div className={`rounded-xl px-4 py-3 min-w-[60%] ${i % 2 === 0 ? "bg-gray-200" : "bg-gradient-to-r from-pink-300 to-purple-300"}`}>
                    <div className="h-4 bg-white/50 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-white/50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div ref={chatContainerRef} className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-4">
              {messages.map((m, index) => (
                <div key={`${m.id || index}-${index}`} className={`flex mt-3 group ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`relative rounded-xl px-4 py-3 max-w-[80%] ${m.role === "user" ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white" : "bg-gray-200 text-gray-800"}`}>
                    {/* Action icons */}
                    <div
                      className={`absolute bottom-full mb-2 flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10
                       ${m.role === "user" ? "right-0" : "left-0"}`}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 dark:hover:bg-gray-600" onClick={() => copyToClipboard(m.content)}>
                              <Copy className="w-4 h-4 text-gray-600 dark:text-white" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy to clipboard</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {m.role === "assistant" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <TextToSpeech text={m.content} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Listen to response</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-full text-sm">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className={`text-2xl font-extrabold mb-2 mt-4 ${m.role === "pediatrician" ? "text-blue-700" : "text-pink-600"}`} {...props} />,
                          h2: ({ node, ...props }) => <h2 className={`text-xl font-semibold mb-2 mt-4 ${m.role === "baby" ? "text-purple-700" : "text-blue-600"}`} {...props} />,
                          h3: ({ node, ...props }) => <h3 className={`text-lg font-semibold mb-2 mt-4 ${m.role === "nani" ? "text-green-700" : "text-pink-500"}`} {...props} />,
                          h4: ({ node, ...props }) => <h4 className={`text-base font-semibold mb-2 mt-4 ${m.role === "general" ? "text-orange-700" : "text-purple-500"}`} {...props} />,
                          p: ({ node, ...props }) => <p className="text-sm leading-relaxed mb-2" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside text-sm mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="ml-4 mb-1" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                          em: ({ node, ...props }) => <em className="italic" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />,
                          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-pink-300 pl-4 italic text-sm text-gray-600 my-2" {...props} />,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                    <span className={`text-xs block mt-1 ${m.role === "user" ? "text-gray-300" : "text-pink-700"}`}>{formatTime(m.createdAt)}</span>
                  </div>
                  {m.role === "assistant" && (
                    <div className="flex justify-start mt-2">
                      <TextToSpeech text={m.content} />
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start mt-3">
                  <div className="rounded-xl px-4 py-2 max-w-[80%] bg-gray-200 text-gray-800 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">NeoNest AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {showNewMessageButton && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  scrollToBottom();
                  setShowNewMessageButton(false);
                }}
                className="text-sm text-white bg-pink-600 px-4 py-1 rounded-full shadow-md hover:bg-pink-700 transition"
              >
                ⬇ New Message
              </button>
            </div>
          )}

          <form
  onSubmit={(e) => {
    e.preventDefault();
    // Only send message, do NOT touch mic button or isListening
    handleSubmit(e);
  }}
  className="flex gap-2 pt-4 items-center"
>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... Speak now..." : "Ask me about baby care..."}
              className={`flex-1 dark:text-white ${isListening ? "border-green-500 bg-green-50 " : "border-pink-300 dark:bg-gray-700"}`}
              disabled={isSending}
            />
            {/* Explicit mic button that passes "button" as the source when clicked */}
            <button
              type="button"
              onClick={() => {
                console.log("Mic button clicked. Current isListening:", isListening);
                setListeningFromSource(!isListening, "button");
              }}
              disabled={isSending}
              aria-pressed={isListening}
              className={`p-2 rounded-full ml-1 border ${isListening ? "bg-red-100 dark:bg-red-600" : "bg-white dark:bg-gray-700"} hover:opacity-90 transition`}
              title={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
            </button>

            <Button
              type="submit"
              disabled={isSending || !input.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 dark:text-gray-100" />}
            </Button>

            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-3 py-2 rounded ml-2"
            >
              Clear Chat
            </button>
          </form>
          {/* Confirm Modal */}
          {showConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white dark:bg-gray-700 p-6 rounded shadow-lg w-80">
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Confirm Clear Chat</h3>
                <p className="mb-4">This will remove all messages from this chat. Are you sure?</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      clearChatHistory("user");
                      setShowConfirm(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="max-w-4xl mx-auto space-y-4">
        <Card className="dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-200">
              <BarChart3 className="h-5 w-5" />
              Chat Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <MessageSquare className="mx-auto text-pink-500" />
              <p className="font-bold dark:text-gray-200">{analytics.totalChats}</p>
              <p className="text-xs text-gray-500 dark:text-gray-200">Total Conversations</p>
            </div>
            <div>
              <Users className="mx-auto text-purple-500" />
              <p className="font-bold dark:text-gray-200 ">{analytics.totalMessages}</p>
              <p className="text-xs text-gray-500 dark:text-gray-200">Messages Sent</p>
            </div>
            <div>
              <Clock className="mx-auto text-blue-500" />
              <p className="font-bold dark:text-gray-200">{analytics.averageResponseTime}s</p>
              <p className="text-xs text-gray-500 dark:text-gray-200">Avg. Response Time</p>
            </div>
            <div>
              <ThumbsUp className="mx-auto text-green-500" />
              <p className="font-bold dark:text-gray-200">{analytics.satisfactionRate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-200">Satisfaction</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-200">Top Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.topQuestions?.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q.question)}
                className="flex justify-between text-sm border-b pb-1 w-full text-left hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 px-2 py-1 rounded transition"
              >
                <span>{q.question}</span>
                <Badge variant="secondary">{q.count}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}