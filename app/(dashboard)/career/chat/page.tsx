"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  link?:
    | {
        text: string;
        url: string;
        icon?: string;
      }
    | string;
  actionLink?: {
    text: string;
    url: string;
  };
  attachment?: {
    name: string;
    size: string;
  };
}

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "user",
      content: "Run a 10-sec scan of my Resume",
    },
    {
      id: "2",
      type: "ai",
      content: "Here's your updated Resume.",
      link: {
        text: "Remi Ladi Resume.pdf\n55kb",
        url: "#",
      },
    },
    {
      id: "3",
      type: "user",
      content:
        "Create a planned goal to secure this job opening at Nike, see link below:",
    },
    {
      id: "4",
      type: "ai",
      content:
        "I have created a 5-day plan that starts today, it will equip you with all you will need to secure the job.",
      link: {
        text: "View Calendar Plan",
        url: "#",
      },
    },
  ]);

  const getTitleFromPath = (path: string) => {
    if (path.includes("/chat")) return "Chat";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const handleSend = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
    };
    setMessages([...messages, newMessage]);
  };

  const handleAttach = () => {
    console.log("Attach file clicked");
  };

  const handleMicrophone = () => {
    console.log("Microphone clicked");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] w-full mx-auto px-8 py-6">
          {/* Breadcrumb */}
          <Link
            href="/career"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Career Advisory / Chat
          </Link>

          <hr className="mb-8 border-gray-200" />

          {/* Chat Messages */}
          <div className="space-y-6 mb-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "ai" ? (
                  <div className="max-w-xl">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        {message.content}
                      </p>
                      {message.link && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">
                            {typeof message.link === "object"
                              ? message.link.icon || "📄"
                              : "🔗"}
                          </span>
                          {typeof message.link === "object" ? (
                            <button className="text-gray-900 font-medium hover:text-indigo-600 transition-colors">
                              {message.link.text}
                            </button>
                          ) : (
                            <a
                              href={message.link}
                              className="text-indigo-600 text-sm hover:underline break-all"
                            >
                              {message.link}
                            </a>
                          )}
                        </div>
                      )}
                      {message.actionLink && (
                        <a
                          href={message.actionLink.url}
                          className="inline-block text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition-colors"
                        >
                          {message.actionLink.text}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-xl">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-800 leading-relaxed mb-3">
                        {message.content}
                      </p>
                      {message.attachment && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">📄</span>
                          <div>
                            <div className="text-indigo-600 font-medium">
                              {message.attachment.name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {message.attachment.size}
                            </div>
                          </div>
                        </div>
                      )}
                      {message.link && typeof message.link === "string" && (
                        <a
                          href={message.link}
                          className="text-indigo-600 text-sm hover:underline break-all"
                        >
                          {message.link}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Input Footer */}
      <InputFooter
        placeholder="Ask me to optimize your LinkedIn..."
        onSend={handleSend}
        onAttach={handleAttach}
        onMicrophone={handleMicrophone}
      />
    </div>
  );
}
