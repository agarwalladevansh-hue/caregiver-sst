import { useState, useRef, useEffect } from 'react'
import './Chatbot.css'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_KEY
const SYSTEM_PROMPT = `You are CareMatch Assistant, a helpful AI for a caregiver matching platform called CareMatch. 
You help users understand how the system works and answer questions about caregivers, bookings, and the AI matching algorithm.
Keep responses concise (2-3 sentences max), friendly, and focused on CareMatch features.
Topics you handle: how the system works, urgency levels, duration, child age, caregiver ratings, availability, distance, experience, cancellation rates, bookings completed, response time, match scores, AI fairness, troubleshooting.
Always be helpful and professional.`

// Fallback knowledge base for when OpenAI is unavailable
const fallbackKB = {
  "how works|how does it work|explain": "🤖 CareMatch uses AI to match you with the best caregiver! You tell us what you need (urgency, duration, child age), our system analyzes 5 caregivers, and picks the best match based on ratings, experience, distance, and reliability.",
  "urgency|how urgent": "⏰ Urgency shows how time-critical your booking is (0-30% not urgent, 30-70% moderate, 70-100% very urgent). System prioritizes available caregivers with good response times.",
  "duration|how long|hours": "⏱️ Duration is how many hours you need the caregiver (0-12 hours). System matches caregivers who typically work that timeframe.",
  "child age|age|baby": "👶 Child age helps match caregivers with relevant experience. Our caregivers' profiles show what ages they specialize in.",
  "rating|quality|reviews": "⭐ Ratings show caregiver quality based on parent reviews (0-1 scale, 1 = perfect). Higher rated caregivers = better outcomes.",
  "available|availability": "✅ Availability shows if a caregiver can take your booking. Green ✓ = Available, Red X = Not available.",
  "distance|how far|km": "📍 Distance shows how far the caregiver is (km). Closer caregivers preferred but balanced with other factors like rating & experience.",
  "experience|years": "💼 Experience shows how long a caregiver has worked. More experienced typically = better outcomes. Look for 5+ years.",
  "cancellation|cancel|reliability": "🚨 Cancellation rate shows reliability. Low = Very reliable ✓, High = May cancel (risky). System avoids high cancellation rates.",
  "bookings|completed|track record": "📊 Bookings completed shows track record. Higher = More experienced. Proves reliability beyond just ratings.",
  "response time|reply|how quick": "⚡ Response time shows how quickly they reply. Lower = faster, important for urgent bookings.",
  "score|match score|calculated": "📈 Match Score combines: 30% Rating, 20% Distance, 20% Experience, 15% Bookings, 10% Reliability, 5% Response time.",
  "help|support|problem": "🆘 Need help? Make sure sliders are adjusted, try refreshing the page, or check if backend is running.",
  "bye|goodbye|exit": "👋 Goodbye! Feel free to ask me anything. Happy matching! 🏥"
}

function getFallbackResponse(userMessage) {
  const lower = userMessage.toLowerCase()
  
  for (const [keywords, response] of Object.entries(fallbackKB)) {
    if (keywords.split('|').some(keyword => lower.includes(keyword))) {
      return response
    }
  }
  
  return "Great question! I cover topics like how CareMatch works, caregiver attributes (rating, availability, distance, experience, reliability, response time), urgency, duration, child age, and match scoring.\n\nTry asking: 'How does it work?', 'What is urgency?', 'How is the score calculated?'"
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm your CareMatch Assistant (AI-powered). How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [usesFallback, setUsesFallback] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ESC key to close
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [isOpen])

  const callOpenAI = async (userMessage) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
              .filter(msg => msg.id > 1)
              .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
              })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.log('OpenAI error:', error)
        // Fall back to rule-based chatbot
        setUsesFallback(true)
        return null
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('OpenAI Error:', error)
      setUsesFallback(true)
      return null
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      let botResponse = await callOpenAI(inputValue)
      
      // If OpenAI fails, use fallback
      if (!botResponse) {
        botResponse = getFallbackResponse(inputValue)
      }

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          title="Open CareMatch Assistant"
        >
          <span className="chat-icon">💬</span>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="chatbot-widget">
          {/* Header with Close Button */}
          <div className="chatbot-header">
            <div className="header-content">
              <h3>CareMatch Assistant</h3>
              <p>{usesFallback ? 'Smart Fallback Mode 🔧' : 'AI-Powered Help 🤖'}</p>
            </div>
            <button
              className="close-btn"
              onClick={handleClose}
              title="Close chat (ESC)"
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {message.sender === 'bot' && <span className="bot-avatar">🤖</span>}
                <div className="message-bubble">
                  {message.text.split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
                {message.sender === 'user' && <span className="user-avatar">👤</span>}
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <span className="bot-avatar">🤖</span>
                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="chatbot-input"
              disabled={isLoading}
              autoFocus
            />
            <button 
              type="submit" 
              className="send-btn" 
              title="Send message"
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </form>

          {/* Info */}
          <div className="chatbot-footer">
            {usesFallback && (
              <p style={{ color: '#F59E0B', fontWeight: '600', marginBottom: '8px' }}>
                ⚠️ Using smart fallback (OpenAI unavailable)
              </p>
            )}
            <p>💡 Ask about how CareMatch works, caregiver attributes, or booking help</p>
            <p style={{ fontSize: '0.75em', color: 'var(--text-light)', marginTop: '4px' }}>
              Press ESC to close
            </p>
          </div>
        </div>
      )}
    </>
  )
}
