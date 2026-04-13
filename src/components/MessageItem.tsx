import React from "react";
import { cn } from "../lib/utils";
import { CHAR_AVATAR } from "../constants";
import { useSettings } from "../contexts/SettingsContext";
import { Heart, Skull, Copy, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MessageItemProps {
  content: string;
  role: "user" | "assistant";
  userName: string;
  scoreChange?: number;
  charAvatar: string;
  variantsCount?: number;
  currentVariantIndex?: number;
  onSelectVariant?: (index: number) => void;
  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  content,
  role,
  userName,
  scoreChange,
  charAvatar,
  variantsCount,
  currentVariantIndex,
  onSelectVariant,
  onCopy,
  onEdit,
  onDelete,
}) => {
  const isAssistant = role === "assistant";
  const { settings } = useSettings();

  // Replace {{user}} with actual name and hide [GET: ...] tags
  const processedContent = content
    .replace(/{{user}}/g, userName)
    .replace(/\[GET:\s*.*?\]/g, "")
    .trim();

  // Split into paragraphs based on \n or \n\n
  const paragraphs = processedContent.split(/\n+/);

  const formatText = (text: string) => {
    // Regex for quotes: "..." or “…”
    const quoteRegex = /(".*?"|“.*?”)/g;
    
    // Split by quotes to handle them separately
    const parts = text.split(quoteRegex);

    return parts.map((part, index) => {
      if (part.match(quoteRegex)) {
        return (
          <span
            key={index}
            className="text-[#005bb5] dark:text-blue-400 font-medium"
          >
            {part}
          </span>
        );
      }
      // Non-quote parts are narration (italicized)
      return <span key={index} className="italic opacity-90">{part}</span>;
    });
  };

  return (
    <div
      className={cn(
        "flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] items-end gap-2 group relative",
          isAssistant ? "flex-row" : "flex-row-reverse"
        )}
        tabIndex={0}
      >
        {isAssistant && (
          <div className="flex-shrink-0 mb-1">
            <img
              src={charAvatar}
              alt="AI Avatar"
              className="w-8 h-8 rounded-full border border-pink-200 dark:border-gray-700"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        
        <div
          className={cn(
            "p-4 rounded-2xl shadow-sm relative",
            isAssistant
              ? "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-bl-none"
              : "bg-[#ffb6c1] dark:bg-[#4a3b3d] text-[#333] dark:text-white rounded-br-none"
          )}
        >
          {paragraphs.map((p, i) => (
            <p key={i} className={cn("leading-relaxed", i < paragraphs.length - 1 && "mb-3")}>
              {formatText(p)}
            </p>
          ))}

          {/* Score Change Indicators */}
          {isAssistant && scoreChange && (
            <div className="absolute -right-2 -top-2 flex gap-1">
              {scoreChange === 5 && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-lg border border-pink-100 dark:border-gray-700"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </motion.div>
              )}
              {scoreChange === -5 && (
                <motion.div
                  initial={{ scale: 0, rotate: 20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <Skull className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                </motion.div>
              )}
            </div>
          )}

          {/* Variants Navigation */}
          {isAssistant && variantsCount && variantsCount > 1 && currentVariantIndex !== undefined && onSelectVariant && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50 text-xs text-gray-400">
              <button
                onClick={() => onSelectVariant(currentVariantIndex - 1)}
                disabled={currentVariantIndex === 0}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono">
                {currentVariantIndex + 1} / {variantsCount}
              </span>
              <button
                onClick={() => onSelectVariant(currentVariantIndex + 1)}
                disabled={currentVariantIndex === variantsCount - 1}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons for User Messages */}
        {!isAssistant && (
          <div className="absolute top-0 right-full mr-2 flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-pink-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto focus-within:pointer-events-auto transition-opacity duration-200">
            {onCopy && (
              <button onClick={onCopy} className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Sao chép">
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Chỉnh sửa">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Xóa">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
