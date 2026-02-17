import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../store/userStore.ts';

const EMOJIS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🥳',
  '🤩',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '☹️',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😬',
  '🙄',
  '🤢',
  '🤮',
  '🤧',
  '😷',
  '🤒',
  '🤕',
  '🤑',
  '🤠',
  '😈',
  '👿',
  '👹',
  '👺',
  '🤡',
  '💀',
  '☠️',
  '👻',
  '👽',
  '👾',
  '🤖',
  '🎃',
  '💩',
  '👍',
  '👎',
  '👌',
  '✌️',
  '🤞',
  '🤟',
  '🤘',
  '🤙',
  '🖖',
  '👋',
  '🤚',
  '🖐',
  '✋',
  '🖖',
  '👌',
  '✌️',
  '🤏',
  '✍️',
  '🤳',
  '💪',
  '🦾',
  '🦵',
  '🦿',
  '🦶',
  '👂',
  '🦻',
  '👃',
  '🧠',
  '🫀',
  '🫁',
  '❤️',
  '💔',
  '❣️',
  '💕',
  '💞',
  '💓',
  '💗',
  '💖',
  '💘',
  '💝',
  '⚔️',
  '🏹',
  '🛡️',
];

const ChatBox = ({
  chat,
  sendChat,
}: {
  chat: { senderId: string; message: string }[];
  sendChat: (msg: string) => void;
}) => {
  const { currentUser } = useUserStore();
  const [chatInput, setChatInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  // Прокрутка чата вниз
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Закрытие emoji панели при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const insertEmoji = (emoji: string) => {
    if (!inputRef.current) {
      setChatInput((prev) => prev + emoji);
      return;
    }

    const start = inputRef.current.selectionStart ?? chatInput.length;
    const end = inputRef.current.selectionEnd ?? chatInput.length;

    const newValue = chatInput.slice(0, start) + emoji + chatInput.slice(end);

    setChatInput(newValue);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const pos = start + emoji.length;
      inputRef.current?.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="w-full max-w-screen flex flex-col space-y-2 mt-4">
      <h2 className="text-xl font-semibold">Чат</h2>
      <div className="bg-slate-800 rounded-lg p-2 h-64 overflow-y-auto flex flex-col space-y-1">
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`inline-block px-2 py-1 rounded-lg ${
              (msg.senderId?.toString() ?? '') === (currentUser?.id?.toString() ?? '')
                ? 'bg-green-700 text-white text-right'
                : 'bg-red-300 text-black text-left'
            }`}
            style={{
              alignSelf:
                (msg.senderId?.toString() ?? '') === (currentUser?.id?.toString() ?? '')
                  ? 'flex-end'
                  : 'flex-start',
            }}
          >
            {msg.message}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2 items-center relative">
        {/* Кнопка emoji */}
        <button
          type="button"
          className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600"
          onClick={() => setShowEmoji((p) => !p)}
        >
          😊
        </button>

        {/* Панель emoji */}
        {showEmoji && (
          <div
            ref={emojiRef}
            className="absolute bottom-12 left-0 z-50 bg-slate-800 p-2 rounded-lg flex flex-wrap gap-2 w-56 shadow-lg"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="text-xl hover:scale-125 transition"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          className="flex-1 px-3 py-1 rounded-lg bg-slate-700 text-white"
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
        />

        <button
          className="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition"
          onClick={handleSendMessage}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
