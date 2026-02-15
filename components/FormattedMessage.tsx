"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FormattedMessageProps {
  content: string;
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Renders AI or user message content with markdown formatting.
 *
 * variant="light" — for AI messages (dark text on white/light bg)
 * variant="dark"  — for user messages (white text on purple bg)
 */
export default function FormattedMessage({
  content,
  variant = "light",
  className = "",
}: FormattedMessageProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={`text-sm leading-relaxed formatted-message ${isDark ? "formatted-dark text-white" : "formatted-light text-gray-800"} ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => (
            <h1 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-base font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-sm font-bold mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className={`list-disc pl-5 mb-2 space-y-1 ${isDark ? "marker:text-white/70" : "marker:text-gray-400"}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal pl-5 mb-2 space-y-1 ${isDark ? "marker:text-white/70" : "marker:text-gray-400"}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code
                  className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                    isDark
                      ? "bg-white/15 text-white"
                      : "bg-gray-100 text-[#5A3FFF]"
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`block p-3 rounded-lg text-xs font-mono overflow-x-auto mb-2 ${
                  isDark
                    ? "bg-white/10 text-white/90"
                    : "bg-gray-50 text-gray-800 border border-gray-200"
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="mb-2 last:mb-0">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-3 pl-3 mb-2 italic ${
                isDark
                  ? "border-white/40 text-white/80"
                  : "border-[#5A3FFF]/30 text-gray-600"
              }`}
            >
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${isDark ? "text-white/90 hover:text-white" : "text-[#5A3FFF] hover:text-[#4A2FEF]"}`}
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className={`my-3 ${isDark ? "border-white/20" : "border-gray-200"}`} />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className={`w-full text-xs border-collapse ${isDark ? "text-white" : "text-gray-800"}`}>
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className={`text-left px-2 py-1.5 font-semibold border-b ${isDark ? "border-white/20" : "border-gray-200"}`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-2 py-1.5 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
