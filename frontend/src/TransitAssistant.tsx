import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, HelpCircle } from 'lucide-react';
import { generateTransitAssistantReply } from './api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Fares {
  distance: string;
  duration: number;
  cab: { hatchback: number; sedan: number; suv: number };
  auto: { official: number; streetMin: number; streetMax: number };
  public: { metro: number; bus: number };
}

interface TransitAssistantProps {
  city: string;
  startName: string;
  endName: string;
  fares: Fares | null;
  onClose: () => void;
}

export const TransitAssistant: React.FC<TransitAssistantProps> = ({
  city,
  startName,
  endName,
  fares,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultGreeting = `Hello! I am your MetriGo AI assistant for **${city}**. I have calculated the rates for your ride from **${startName}** to **${endName}**. Ask me anything about the routes, bus numbers, metro directions, traffic status, or cab/auto cost details!`;

  useEffect(() => {
    setMessages([
      { role: 'assistant', content: defaultGreeting }
    ]);
  }, [city, fares, startName, endName]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const reply = generateTransitAssistantReply(city, startName, endName, fares, textToSend);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Error in AI Assistant:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! I encountered an error generating a response. Please try another question."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(userInput);
  };

  const handleSuggestionClick = (query: string) => {
    handleSendMessage(query);
  };

  // Safe formatting for markdown style bullet points in bubbles
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      let content = line;
      let isBullet = false;
      
      if (line.startsWith('* ') || line.startsWith('- ')) {
        content = line.substring(2);
        isBullet = true;
      }
      
      // Bold syntax helper
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      if (isBullet) {
        return (
          <li key={i} style={{ marginLeft: '15px', marginBottom: '4px' }}>
            {parts.length > 0 ? parts : content}
          </li>
        );
      }
      
      return (
        <p key={i} style={{ marginBottom: '8px' }}>
          {parts.length > 0 ? parts : content}
        </p>
      );
    });
  };

  return (
    <div className="negotiator-panel">
      <div className="chat-header" style={{ background: 'rgba(0, 242, 254, 0.05)' }}>
        <div className="driver-avatar" style={{ background: 'var(--accent-cyan)', border: '2px solid var(--accent-cyan)' }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '15px', color: 'var(--accent-cyan)' }}>MetriGo AI Travel Assistant</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Ask routes, bus route details, metro stops, or dynamic fares
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-bubble ${m.role === 'user' ? 'user' : 'driver'}`}>
            {renderMessageContent(m.content)}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble driver" style={{ display: 'flex', gap: '5px', opacity: 0.7 }}>
            <Sparkles size={14} className="pulse" style={{ color: 'var(--accent-cyan)', animation: 'spin 2s linear infinite' }} />
            Analyzing transit routes...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion tags row */}
      {messages.length === 1 && (
        <div style={{ padding: '0 20px', display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <button 
            className="ai-tab" 
            onClick={() => handleSuggestionClick("How do I go by Metro or Local train?")}
          >
            🚇 Metro Route?
          </button>
          <button 
            className="ai-tab" 
            onClick={() => handleSuggestionClick(`Which local bus numbers run between here?`)}
          >
            🚌 Local Buses?
          </button>
          <button 
            className="ai-tab" 
            onClick={() => handleSuggestionClick("Give me a brief cost comparison between auto and cab.")}
          >
            💰 Compare Costs
          </button>
          <button 
            className="ai-tab" 
            onClick={() => handleSuggestionClick("Any road construction or traffic delays on this route?")}
          >
            ⚠️ Traffic & Road Alert
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask a question about your route or fares..."
          disabled={loading}
          required
        />
        <button type="submit" className="btn-send" style={{ background: 'var(--accent-cyan)' }} disabled={loading}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
