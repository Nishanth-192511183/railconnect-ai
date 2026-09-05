import { useState } from 'react'
import { Sparkles, Send } from 'lucide-react'

const PROMPTS = [
  'Can I safely take this connection?',
  'Find a cheaper recovery option',
  'Where can I eat near the station?',
  'How much extra will this delay cost?',
]

const RESPONSES = {
  'Can I safely take this connection?': 'Yes — this connection has a 2h buffer and a 92% safety score, well above the 70% threshold RailConnect considers safe.',
  'Find a cheaper recovery option': 'The next available alternative is ₹120 cheaper but adds 40 minutes to the Nagpur arrival. Want me to apply it?',
  'Where can I eat near the station?': 'Paradise Biryani is 0.5 km away and open now, within your 4h 10m waiting window.',
  'How much extra will this delay cost?': 'This delay adds roughly ₹1,380 — mostly the alternative train and one night of accommodation.',
}

export default function AIInsight() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const ask = (text) => {
    if (!text.trim()) return
    const reply = RESPONSES[text] || "Based on your current journey, everything is tracking within safe limits."
    setMessages(m => [...m, { role: 'user', text }, { role: 'ai', text: reply }])
    setInput('')
  }

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Sparkles size={16} color="var(--navy-800)" />
        <h4 style={{ fontSize: 14.5 }}>RailConnect AI</h4>
      </div>

      {messages.length === 0 ? (
        <>
          <p className="text-muted" style={{ fontSize: 13.5, marginBottom: 12 }}>How can I help?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PROMPTS.map(p => (
              <button key={p} onClick={() => ask(p)} style={{
                textAlign: 'left', fontSize: 13, padding: '8px 10px', borderRadius: 6,
                border: '1px solid var(--border)', background: '#FAFBFC',
              }}>
                "{p}"
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', marginBottom: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? 'var(--navy-800)' : '#F1F3F5',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
              padding: '7px 11px', borderRadius: 8, fontSize: 13, maxWidth: '85%',
            }}>
              {m.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask(input)}
          placeholder="Ask about your journey…"
          style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6 }}
        />
        <button onClick={() => ask(input)} aria-label="Send" style={{ padding: '0 12px', background: 'var(--navy-800)', color: '#fff', borderRadius: 6 }}>
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
