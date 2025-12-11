import { useState, useRef, useEffect } from 'react';
import { Brain, X, Send } from 'lucide-react';

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
    { label: 'Best option?', color: 'bg-purple-100 text-purple-700' },
    { label: 'Improve tips', color: 'bg-blue-100 text-blue-700' },
    { label: 'EMI info', color: 'bg-emerald-100 text-emerald-700' },
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

  const handleQuickAction = (label: string) => {
    setInputValue(label);
    handleSend();
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-50 animate-pulse"
        >
          <Brain className="w-8 h-8" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 p-6 text-white relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Assistant</h3>
                <p className="text-white/90 text-sm">Always here to help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl px-5 py-4 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white border-2 border-purple-100 text-slate-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-purple-100 rounded-3xl px-5 py-4 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-3 flex gap-2 bg-white border-t border-slate-100">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.label)}
                className={`${action.color} px-4 py-2 rounded-full text-xs font-medium hover:scale-105 transition-transform`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-full focus:outline-none focus:border-purple-400 transition-colors text-slate-800 placeholder-slate-400"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-purple-500/30"
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