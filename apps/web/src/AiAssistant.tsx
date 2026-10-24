import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Bot, RotateCcw, Send, Sparkles, UserRound } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };
const greeting: ChatMessage = { id: 'greeting', role: 'assistant', content: 'Hi! Ask me anything. I can help with interview preparation, career questions, learning, or general topics.' };
const suggestions = ['Help me prepare for an interview', 'Explain a technical concept simply', 'Give me feedback on my answer'];

export function AiAssistant({ token }: { token: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy]);

  async function sendMessage(value = draft) {
    const content = value.trim();
    if (!content || busy) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setDraft('');
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: conversation.filter((item) => item.id !== 'greeting').slice(-12).map(({ role, content: text }) => ({ role, content: text })) }),
      });
      const result = await response.json().catch(() => ({})) as { answer?: string; message?: string };
      if (!response.ok) throw new Error(result.message ?? 'The assistant could not answer. Please try again.');
      if (!result.answer) throw new Error('The assistant returned an empty answer. Please try again.');
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: result.answer! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The assistant could not answer. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function clearConversation() {
    setMessages([greeting]);
    setError('');
  }

  return <section className="ai-assistant-page">
    <header className="ai-assistant-header"><div className="ai-assistant-avatar"><Sparkles size={20} /></div><div><div className="eyebrow">INTERVIEWLY AI</div><h2>Ask anything</h2><p>Get help with interview practice, career topics, learning, and more. Messages are sent to your configured AI provider.</p></div><button className="ai-clear-button" onClick={clearConversation} disabled={busy}><RotateCcw size={14} /> New chat</button></header>
    <div className="ai-chat-window" aria-live="polite">
      {messages.map((message) => <article className={`ai-chat-message ${message.role}`} key={message.id}><div className="ai-message-avatar">{message.role === 'assistant' ? <Bot size={16} /> : <UserRound size={16} />}</div><div className="ai-message-content"><span>{message.role === 'assistant' ? 'Interviewly AI' : 'You'}</span><p>{message.content}</p></div></article>)}
      {busy && <article className="ai-chat-message assistant"><div className="ai-message-avatar"><Bot size={16} /></div><div className="ai-message-content"><span>Interviewly AI</span><p className="ai-typing">Thinking…</p></div></article>}
      {error && <div className="ai-chat-error" role="alert">{error}</div>}
      {messages.length === 1 && <div className="ai-suggestions">{suggestions.map((suggestion) => <button key={suggestion} disabled={busy} onClick={() => void sendMessage(suggestion)}>{suggestion}</button>)}</div>}
      <div ref={endRef} />
    </div>
    <form className="ai-chat-composer" onSubmit={submit}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} rows={2} maxLength={3000} placeholder="Ask a question…" aria-label="Message Interviewly AI" disabled={busy} /><div className="ai-composer-footer"><span>Enter to send · Shift + Enter for a new line</span><button className="button button-primary" type="submit" disabled={busy || !draft.trim()}>{busy ? 'Sending…' : 'Send'}<Send size={14} /></button></div></form>
  </section>;
}
