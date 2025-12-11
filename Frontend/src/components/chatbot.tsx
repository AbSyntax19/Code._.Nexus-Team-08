import { useState, useRef, useEffect } from 'react';
import { Brain, X, Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI loan assistant. Ask me anything about eligibility, rates, or loan strategies!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { label: 'Best option?', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { label: 'Improve tips', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { label: 'EMI info', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  ];

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('rate') || lowerInput.includes('interest')) {
      return "Current loan rates vary based on your credit score and loan type. Personal loans typically range from 6-36% APR, while mortgages are around 6-8%. I can help you find the best rate for your situation!";
    } else if (lowerInput.includes('eligibility') || lowerInput.includes('qualify')) {
      return "To qualify for most loans, you'll need: a credit score of 620+, stable income, debt-to-income ratio below 43%, and employment history. Want me to check your specific eligibility?";
    } else if (lowerInput.includes('emi') || lowerInput.includes('payment')) {
      return "EMI (Equated Monthly Installment) is calculated using: Principal amount, Interest rate, and Loan tenure. For example, a $10,000 loan at 10% for 2 years would be approximately $461/month. Would you like me to calculate your EMI?";
    } else if (lowerInput.includes('best') || lowerInput.includes('option')) {
      return "The best loan option depends on your needs! Personal loans are great for debt consolidation, home equity loans for renovations, and auto loans for vehicles. Tell me more about what you need the loan for!";
    } else if (lowerInput.includes('improve') || lowerInput.includes('tips') || lowerInput.includes('better')) {
      return "Here are tips to improve your loan terms: 1) Boost your credit score by paying bills on time, 2) Reduce existing debt, 3) Increase your down payment, 4) Compare multiple lenders, 5) Consider a co-signer. Which area would you like to focus on?";
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! I'm here to help you with all your loan questions. Whether you need information about rates, eligibility, or strategies, just ask!";
    } else {
      return "That's a great question! I can help you with loan eligibility criteria, interest rates, EMI calculations, and strategies to get better loan terms. What specific aspect would you like to know more about?";
    }
  };


  
  // Actually, let's fix the quick action behavior to immediately send
  const triggerQuickAction = (label: string) => {
      const userMessage: Message = {
      id: Date.now().toString(),
      text: label,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(label),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }


  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/40 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center text-white border border-white/10 group"
        >
          <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[600px] glass-card flex flex-col z-50 overflow-hidden border border-white/10 shadow-2xl rounded-3xl animate-fade-in origin-bottom-right transition-all">
          {/* Header */}
          <div className="bg-slate-900/50 backdrop-blur-md p-4 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                <Brain className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">FinAI Assistant</h3>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-bl-none'
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="text-[10px] opacity-50 mt-1 block text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 px-4 py-3 rounded-2xl rounded-bl-none border border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/5 bg-slate-900/30">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => triggerQuickAction(action.label)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-900/50 backdrop-blur-md border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask financial questions..."
                className="flex-1 glass-input px-4 py-2.5 rounded-xl text-sm focus:ring-0"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}