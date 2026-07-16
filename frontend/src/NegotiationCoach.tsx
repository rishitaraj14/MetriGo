import React, { useState, useRef, useEffect } from 'react';
import { Send, UserCheck, XCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateNegotiationResponse } from './api';

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

interface NegotiationCoachProps {
  city: string;
  startName: string;
  endName: string;
  fares: Fares | null;
  onClose: () => void;
}

export const NegotiationCoach: React.FC<NegotiationCoachProps> = ({
  city,
  startName,
  endName,
  fares,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'negotiating' | 'accepted' | 'rejected'>('negotiating');
  const [finalFare, setFinalFare] = useState<number | null>(null);
  const [bargainScore, setBargainScore] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Driver details helper
  const getDriverDetails = (cityName: string) => {
    const c = cityName.toLowerCase();
    if (c.includes('chennai')) {
      return { name: 'Murugan (Chennai Auto)', greeting: 'Vandiyila yeru pa! Tell me where? Anna Nagar to T Nagar? No meter, only Rs 220.' };
    } else if (c.includes('bangalore') || c.includes('bengaluru')) {
      return { name: 'Manjunath (Namma Auto)', greeting: 'Indiranagar to Koramangala? Heavy traffic maga. Direct flat Rs 250!' };
    } else if (c.includes('mumbai') || c.includes('delhi')) {
      return { name: 'Rampal (Local Auto)', greeting: 'Chalo bhaiya, standard rate double ticket. Rs 200 fixed pricing.' };
    }
    return { name: 'Bhaiya (City Auto)', greeting: 'Aao chalo, traffic is very bad today. ₹180 fixed fare.' };
  };

  const driver = getDriverDetails(city);

  // Initialize conversation
  useEffect(() => {
    setMessages([
      { role: 'assistant', content: driver.greeting }
    ]);
    setStatus('negotiating');
    setFinalFare(null);
    setBargainScore(null);
  }, [city, fares]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading || status !== 'negotiating') return;

    const newMessages = [...messages, { role: 'user' as const, content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const data = generateNegotiationResponse(city, startName, endName, fares, userInput);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      if (data.status === 'accepted') {
        setStatus('accepted');
        setFinalFare(data.finalFare);
        setBargainScore(data.bargainScore);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else if (data.status === 'rejected') {
        setStatus('rejected');
      }
    } catch (error) {
      console.error('Error negotiating:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Aiyo, mobile signal is weak pa. Tell me the amount again?"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      { role: 'assistant', content: driver.greeting }
    ]);
    setStatus('negotiating');
    setFinalFare(null);
    setBargainScore(null);
  };

  // Get dynamic grading message based on bargain score
  const getBargainVerdict = (score: number) => {
    if (score >= 90) return { label: 'Street Master!', color: 'var(--accent-green)', text: 'Fantastic deal! You bargained exactly down to the lowest street rate. Murugan is crying inside!' };
    if (score >= 70) return { label: 'Bargain Pro', color: 'var(--accent-cyan)', text: 'Good job! You paid a very fair street rate. Standard negotiation success.' };
    if (score >= 50) return { label: 'Average Commuter', color: 'var(--accent-yellow)', text: 'Not bad, but you could have pushed lower. You paid slightly above average.' };
    return { label: 'Tourist Tax Paid', color: 'var(--accent-red)', text: 'Oh no! You got completely ripped off! Murugan is laughing all the way to the bank.' };
  };

  const verdict = bargainScore !== null ? getBargainVerdict(bargainScore) : null;

  return (
    <div className="negotiator-panel">
      <div className="chat-header">
        <div className="driver-avatar">🛺</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '15px', color: 'var(--accent-yellow)' }}>{driver.name}</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {status === 'negotiating' ? '🟢 Online & Ready to Bargain' : status === 'accepted' ? '🤝 Deal Locked!' : '❌ Left Chat'}
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

      {status === 'negotiating' && (
        <>
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.role === 'user' ? 'user' : 'driver'}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble driver" style={{ opacity: 0.6 }}>
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Offer an amount (e.g. 'How about 120?')"
              disabled={loading}
              required
            />
            <button type="submit" className="btn-send" disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </>
      )}

      {status === 'accepted' && (
        <div className="chat-messages" style={{ justifyContent: 'center' }}>
          <div className="negotiation-result glass-panel" style={{ padding: '30px', margin: '20px' }}>
            <div style={{ color: 'var(--accent-green)', display: 'flex', justifyContent: 'center' }}>
              <UserCheck size={48} />
            </div>
            <h2 style={{ fontSize: '20px', margin: '10px 0' }}>Deal Accepted!</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Final agreed fare for your trip:
            </p>
            <div style={{ fontSize: '32px', fontWeight: '800', margin: '5px 0' }}>
              ₹{finalFare}
            </div>
            
            {bargainScore !== null && (
              <>
                <div className="score-badge">{bargainScore}%</div>
                <div style={{ fontWeight: '600', color: verdict?.color, fontSize: '15px' }}>
                  {verdict?.label}
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                  {verdict?.text}
                </p>
              </>
            )}

            <button
              onClick={handleReset}
              className="btn-primary"
              style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <RotateCcw size={16} /> Negotiate Again
            </button>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="chat-messages" style={{ justifyContent: 'center' }}>
          <div className="negotiation-result glass-panel" style={{ padding: '30px', margin: '20px' }}>
            <div style={{ color: 'var(--accent-red)', display: 'flex', justifyContent: 'center' }}>
              <XCircle size={48} />
            </div>
            <h2 style={{ fontSize: '20px', margin: '10px 0' }}>Driver Walked Away!</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '0 10px' }}>
              You bargained too low and made the driver angry. They slammed the auto accelerator and drove off without you.
            </p>

            <button
              onClick={handleReset}
              className="btn-primary"
              style={{ marginTop: '20px', background: 'var(--accent-yellow)', color: '#000' }}
            >
              <RotateCcw size={16} /> Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
