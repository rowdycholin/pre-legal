'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { NdaFormData } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
}

interface Props {
  currentFields: NdaFormData;
  onFieldsUpdate: (updated: Partial<NdaFormData>) => void;
}

export default function NdaChat({ currentFields, onFieldsUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const callApi = useCallback(
    async (msgs: Message[]) => {
      setIsLoading(true);
      setMessages((prev) => [...prev, { role: 'assistant', content: '', pending: true }]);

      try {
        const token = localStorage.getItem('auth_token') ?? '';
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: msgs.map((m) => ({ role: m.role, content: m.content })),
            current_fields: currentFields,
          }),
        });

        if (!res.ok || !res.body) throw new Error('Chat request failed');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6);
            if (raw === '[DONE]') continue;
            try {
              const event = JSON.parse(raw);
              if (event.type === 'token') {
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, content: last.content + event.content },
                    ];
                  }
                  return prev;
                });
              } else if (event.type === 'fields') {
                onFieldsUpdate(event.extracted);
              } else if (event.type === 'done') {
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant') {
                    if (!last.content) return prev.slice(0, -1);
                    return [...prev.slice(0, -1), { ...last, pending: false }];
                  }
                  return prev;
                });
              } else if (event.type === 'error') {
                throw new Error(event.message);
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) throw e;
            }
          }
        }
      } catch (err) {
        console.error('Chat error:', err);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.pending) {
            return [
              ...prev.slice(0, -1),
              { role: 'assistant', content: 'Something went wrong. Please try again.' },
            ];
          }
          return prev;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentFields, onFieldsUpdate],
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    callApi([]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    callApi(next);
  }, [input, isLoading, messages, callApi]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content || (
                <span className="flex gap-1 items-center py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-transparent disabled:opacity-50"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-purple-secondary hover:opacity-90 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-opacity"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
