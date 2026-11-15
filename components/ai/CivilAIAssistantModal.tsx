'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle, ShieldCheck, HardHat, RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isOffTopic?: boolean;
}

// Civil engineering domain validation keywords
const CIVIL_KEYWORDS = [
  'concrete', 'cement', 'steel', 'rebar', 'beam', 'column', 'slab', 'footing',
  'excavation', 'foundation', 'boq', 'brick', 'mortar', 'plaster', 'aggregate',
  'sand', 'rcc', 'pcc', 'structural', 'load', 'soil', 'bearing', 'civil',
  'construction', 'building', 'floor', 'plot', 'area', 'sqft', 'sq.ft', 'cft',
  'unit rate', 'cost', 'estimate', 'estimator', 'drawing', 'blueprint', 'site',
  'structure', 'masonry', 'reinforcement', 'shuttering', 'formwork', 'curing',
  'slump', 'compressive', 'grade', 'm20', 'm25', 'fe500', 'fe550', 'damp',
  'waterproofing', 'tile', 'flooring', 'plumbing', 'sanitary', 'roof', 'truss',
  'retaining wall', 'staircase', 'lintel', 'chajja', 'scaffolding', 'asphalt',
  'survey', 'level', 'theodolite', 'autocad', 'cad', 'bim', 'architect'
];

function isCivilEngineeringQuery(query: string): boolean {
  const q = query.toLowerCase();

  // Explicit off-topic checks
  const offTopicKeywords = [
    'recipe', 'cook', 'movie', 'actor', 'song', 'music', 'football', 'cricket',
    'game', 'president', 'politics', 'python', 'javascript code', 'react hook',
    'joke', 'love', 'relationship', 'stocks', 'bitcoin', 'crypto', 'weather'
  ];

  for (const offKey of offTopicKeywords) {
    if (q.includes(offKey)) {
      return false;
    }
  }

  return CIVIL_KEYWORDS.some(key => q.includes(key));
}

function generateCivilResponse(query: string): { text: string; isOffTopic: boolean } {
  if (!isCivilEngineeringQuery(query)) {
    return {
      text: "I am specialized strictly as a Civil Engineering & Construction Assistant. I can only assist with building material estimation, RCC structural design, BOQ scheduling, concrete grades, rebar detailing, foundation calculations, and site engineering queries. Please ask a civil engineering or construction-related question!",
      isOffTopic: true
    };
  }

  const q = query.toLowerCase();

  if (q.includes('m20') || q.includes('m25') || q.includes('concrete grade') || q.includes('mix ratio')) {
    return {
      text: "For standard RCC structural elements:\n• **M20 Grade (1 : 1.5 : 3)**: Standard for slabs, beams, and columns in low-rise residential structures. Min compressive strength: 20 N/mm² at 28 days.\n• **M25 Grade (1 : 1 : 2)**: Recommended for heavy load columns, footings, and multi-storey structures. Min compressive strength: 25 N/mm².\n• **Water-Cement Ratio**: Maintain 0.45 to 0.50 for optimum strength & workability.",
      isOffTopic: false
    };
  }

  if (q.includes('cement') || q.includes('bag') || q.includes('quantity')) {
    return {
      text: "Standard Civil Engineering Bag Estimation Rules:\n• **1 m³ RCC Concrete (M20)** ≈ 8.0 bags of cement (50 kg bags).\n• **100 CFT RCC Concrete** ≈ 22.6 bags of cement.\n• **Brickwork (1:6 mortar)**: Approx 1.25 bags cement per 100 CFT of 9-inch thick brickwork.\n• **Plastering (1:4 mortar, 12mm)**: Approx 0.27 bags cement per 100 sq.ft area.",
      isOffTopic: false
    };
  }

  if (q.includes('steel') || q.includes('rebar') || q.includes('weight')) {
    return {
      text: "Standard Steel Rebar Weight Formula:\n**Weight per meter (kg/m) = d² / 162** (where d is diameter in mm)\n• **8 mm**: 0.395 kg/m (Stirrups/Ties)\n• **10 mm**: 0.617 kg/m (Slab reinforcement)\n• **12 mm**: 0.888 kg/m (Main slab/Beam bars)\n• **16 mm**: 1.578 kg/m (Column/Beam main reinforcement)\n• **20 mm**: 2.466 kg/m (Heavy column main bars)",
      isOffTopic: false
    };
  }

  if (q.includes('footing') || q.includes('excavation') || q.includes('depth')) {
    return {
      text: "Foundation & Soil Bearing Guidelines:\n• **Minimum Depth**: 4.0 ft to 6.0 ft below natural ground level to hit hard strata.\n• **PCC Bedding**: 4 inches (100mm) thick using 1:4:8 nominal concrete mix.\n• **Footing Concrete**: Isolated trapezoidal or stepped footing in M20/M25 grade RCC.\n• Standard safe bearing capacity (SBC) assumption for normal medium clay/sandy soil: 150 kN/m².",
      isOffTopic: false
    };
  }

  return {
    text: `Based on standard civil engineering practice:\n\nRegarding your query about "${query.trim()}":\n• Always adhere to standard IS 456:2000 (Plain and Reinforced Concrete Code of Practice).\n• Ensure proper clear cover for steel rebar (Slabs: 15-20mm, Beams: 25mm, Columns: 40mm, Footings: 50mm).\n• Allow a standard wastage factor of 3%–5% for cement and steel rebar during quantity take-offs.`,
    isOffTopic: false
  };
}

export function CivilAIAssistantModal({ isOpen: externalIsOpen, onClose: externalOnClose }: { isOpen?: boolean; onClose?: () => void }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    setInternalIsOpen(false);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your Civil Engineering Assistant. Ask me anything about concrete mix ratios, rebar calculations, BOQ scheduling, cement quantities, or foundation design rules.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const res = generateCivilResponse(userText);
      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOffTopic: res.isOffTopic
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Floating Assistant Window */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] border border-slate-200 animate-fade-in transition-all">
          {/* Header */}
          <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-sm">
                <HardHat className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs flex items-center space-x-1.5">
                  <span>Civil AI Assistant</span>
                  <span className="text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    Civil Only
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Strictly civil & site estimation queries</p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notice Banner */}
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-1.5 flex items-center justify-between text-[10px] text-amber-800 font-semibold">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="h-3 w-3 text-amber-600 flex-shrink-0" />
              <span>Strict Filter: Only Civil Engineering questions answered.</span>
            </span>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-3xs font-bold ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white'
                      : m.isOffTopic
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {m.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : m.isOffTopic
                      ? 'bg-red-50 text-red-900 border border-red-200 rounded-tl-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {m.isOffTopic && (
                    <div className="flex items-center space-x-1 text-red-600 font-bold mb-1 text-[10px]">
                      <AlertCircle className="h-3 w-3" />
                      <span>Non-Civil Query Declined</span>
                    </div>
                  )}
                  <div>{m.text}</div>
                  <div className="mt-1 text-[8px] font-semibold text-right text-slate-400">
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 italic">
                <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                <span>Analyzing civil standards...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask M20 mix ratio, rebar weight..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 rounded-xl">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Floating Toggle Icon Button (Visible on whole website) */}
      <button
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setInternalIsOpen(true);
          }
        }}
        className="group relative flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white p-3.5 px-4 rounded-full shadow-2xl border border-slate-700 transition-all hover:scale-105 active:scale-95"
        title="Civil AI Assistant"
      >
        <div className="relative">
          <HardHat className="h-5 w-5 text-amber-400" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        </div>
        <span className="text-xs font-bold hidden sm:inline text-slate-100">
          Civil AI
        </span>
      </button>
    </div>
  );
}
