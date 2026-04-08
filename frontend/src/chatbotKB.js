// Chatbot knowledge base with predefined Q&A
const knowledgeBase = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: "👋 Hi there! I'm the CareMatch Assistant. I can help you understand how our caregiver matching system works, answer questions about caregivers, bookings, and more. What can I help you with?"
  },
  {
    keywords: ['how works', 'how does it work', 'how to use', 'explain'],
    response: "🤖 CareMatch uses AI to match you with the best caregiver! Here's how:\n\n1. You tell us what you need (how urgent, how long, child's age)\n2. Our system analyzes 5 available caregivers\n3. It picks the best match based on ratings, experience, distance, and reliability\n4. You get instant results with why they're recommended!\n\nTry adjusting the sliders and clicking 'Find Best Caregiver' 😊"
  },
  {
    keywords: ['caregiver', 'who are caregivers', 'what caregivers'],
    response: "👩‍⚕️ Our caregivers are vetted professionals evaluated on:\n\n• Rating (quality & reviews)\n• Availability (when they can work)\n• Distance (how close they are)\n• Experience (years in caregiving)\n• Cancellation Rate (reliability)\n• Bookings Completed (track record)\n• Response Time (how quick they reply)\n\nEach match shows all these details!"
  },
  {
    keywords: ['urgency', 'how urgent', 'what is urgency'],
    response: "⏰ Urgency shows how time-critical your booking is:\n\n• 0-30% = Not urgent, can plan ahead\n• 30-70% = Moderately urgent\n• 70-100% = Very urgent, need quickly!\n\nThe system prioritizes available caregivers with good response times for urgent requests."
  },
  {
    keywords: ['duration', 'how long', 'booking hours'],
    response: "⏱️ Duration is how many hours you need the caregiver:\n\n• The slider shows 0-12 hours\n• System matches caregivers who typically work that timeframe\n• Experienced caregivers with good availability get priority"
  },
  {
    keywords: ['child age', 'age', 'baby', 'infant', 'toddler'],
    response: "👶 The child's age helps the system match caregivers with relevant experience:\n\n• 0-3 years: Infants & toddlers (special care)\n• 3-6 years: Preschool age\n• 6+ years: School age (may need homework help)\n\nOur caregivers' experience profiles show what ages they specialize in."
  },
  {
    keywords: ['rating', 'quality', 'how rated', 'reviews'],
    response: "⭐ Ratings show caregiver quality based on:\n\n• Parent reviews & satisfaction\n• 0-1 scale (1 = perfect!)\n• Higher rated caregivers = better outcomes\n• Our model prioritizes high ratings in matching"
  },
  {
    keywords: ['availability', 'available', 'is available'],
    response: "✅ Availability shows if a caregiver can take your booking:\n\n• Green checkmark ✓ = Available now\n• Red X = Not available (can't book)\n• System automatically filters out unavailable caregivers"
  },
  {
    keywords: ['distance', 'how far', 'km', 'close', 'location'],
    response: "📍 Distance shows how far the caregiver is from you:\n\n• Measured in kilometers (0-10 km)\n• Closer caregivers are preferred (less travel time)\n• But it's balanced with other factors like rating & experience\n• Shows in the caregiver details"
  },
  {
    keywords: ['experience', 'years', 'experienced', 'years of experience'],
    response: "💼 Experience shows how long a caregiver has been working:\n\n• 0-20 years scale\n• More experienced = better outcomes typically\n• Combined with ratings to find the best match\n• Look for caregivers with 5+ years for peace of mind"
  },
  {
    keywords: ['cancellation', 'cancel', 'reliability', 'cancellation rate'],
    response: "🚨 Cancellation Rate shows reliability:\n\n• Low rate = Very reliable ✓\n• High rate = May cancel (risky)\n• Our model avoids booking with high cancellation rates\n• Look for caregivers with <20% cancellation"
  },
  {
    keywords: ['bookings', 'completed', 'track record'],
    response: "📊 Bookings Completed shows their track record:\n\n• Number of successful bookings they've done\n• Higher = More experienced in real situations\n• Helps prove reliability beyond just ratings\n• Shows caregivers who deliver results"
  },
  {
    keywords: ['response time', 'response', 'reply', 'how quick'],
    response: "⚡ Response Time shows how quickly they reply:\n\n• Lower = Faster responses (good!)\n• Important for last-minute bookings\n• Especially critical for urgent requests\n• Quick responders less likely to have your booking fall through"
  },
  {
    keywords: ['score', 'total score', 'match score', 'how calculated'],
    response: "📈 The Match Score (0-1) combines:\n\n• 30% Rating (quality)\n• 20% Distance (proximity)\n• 20% Experience (expertise)\n• 15% Bookings (track record)\n• 10% Reliability (1 - cancellation rate)\n• 5% Response Time\n\nHigher score = better overall match!"
  },
  {
    keywords: ['recommend', 'recommended', 'why', 'why this caregiver'],
    response: "🎯 Our AI recommends based on:\n\n1. Who's available for your timing\n2. Quality of their profile (ratings, experience)\n3. Reliability (low cancellations)\n4. How quickly they respond\n5. Proximity to you\n\nThe explanation breakdown shows exactly why we picked them!"
  },
  {
    keywords: ['ai', 'machine learning', 'algorithm', 'model'],
    response: "🤖 CareMatch uses advanced AI:\n\n• PPO (Proximal Policy Optimization) reinforcement learning\n• Trained on 10,000 booking scenarios\n• Learns what makes successful matches\n• Gets smarter with real feedback\n\nIt's not just filtering - it actually learns what works!"
  },
  {
    keywords: ['fair', 'bias', 'discrimination'],
    response: "✨ CareMatch is designed to be fair:\n\n• No gender, race, or demographic bias\n• Only evaluates actual professional qualifications\n• Ratings based on performance, not identity\n• Transparent scoring - you see exactly why we matched them\n\nWe believe in blind, skills-based matching!"
  },
  {
    keywords: ['help', 'support', 'problem', 'issue', 'error'],
    response: "🆘 Need help?\n\n1. Check that all sliders are adjusted\n2. Try refreshing the page\n3. Make sure the backend server is running\n4. Contact support for more complex issues\n\nWhat specific problem are you facing?"
  },
  {
    keywords: ['thank', 'thanks', 'thanks!', 'thank you'],
    response: "😊 You're welcome! Happy to help. Any other questions about CareMatch? 🎯"
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'exit', 'close'],
    response: "👋 Goodbye! Feel free to ask me anything anytime. Happy matching! 🏥"
  }
];

// Function to find the best matching response
export const getBotResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // If empty, ask for clarification
  if (!lowerMessage) {
    return "I didn't catch that. Could you please rephrase your question? 😊";
  }
  
  // Search through knowledge base
  for (let qa of knowledgeBase) {
    for (let keyword of qa.keywords) {
      if (lowerMessage.includes(keyword)) {
        return qa.response;
      }
    }
  }
  
  // Default fallback response
  return "Great question! I cover topics like how CareMatch works, caregiver ratings, availability, distance, experience, booking duration, urgency levels, reliability, response times, and our AI matching algorithm.\n\nCould you ask more specifically about any of these? 😊\n\nTry asking: 'How does it work?', 'What is urgency?', 'How is the match score calculated?'";
};
