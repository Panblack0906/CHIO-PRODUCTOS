import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minus, RefreshCw, Sparkles, Smile, ArrowRight, HelpCircle } from 'lucide-react';
import { productsData } from '../../data/products-data';
import { getDBItem } from '../utils/db';

interface ChatMessage {
  id: string;
  sender: 'user' | 'chioly';
  text: string;
  timestamp: Date;
}

export function ChiolyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Default welcome message
  const welcomeText = `¡Holiii! 👋🎀

Soy **Chío**, tu compañera y asesora virtual en CHIO Productos 🛍️✨

¿Necesitas ayuda con alguna recomendación? Dime qué estás buscando y Chío te recomienda los productos ideales.

Cuéntame… ¿qué estás necesitando hoy? 🌸`;

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: 'welcome-1',
        sender: 'chioly',
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowNotification(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickAction = (text: string) => {
    handleSendMessageText(text);
  };

  // Helper to pick the most accurate emoji for a product
  const getProductEmoji = (name: string, category: string = ''): string => {
    const n = name.toLowerCase();
    const c = category.toLowerCase();
    if (n.includes('brocha') || n.includes('maquillaje') || n.includes('pincel')) return '🖌️';
    if (n.includes('espejo')) return '🪞';
    if (n.includes('perfume')) return '🌸';
    if (n.includes('ceja') || n.includes('ojos')) return '👁️';
    if (n.includes('joyero') || n.includes('cosmético') || n.includes('cosmetico')) return '💎';
    if (c.includes('belleza') || c.includes('cuidado')) return '💄';

    if (n.includes('pirex') || n.includes('vidrio')) return '🍲';
    if (n.includes('taper') || n.includes('acero')) return '🥣';
    if (c.includes('cocina')) return '🍳';

    if (n.includes('escritorio') || n.includes('madera')) return '🪵';
    if (n.includes('cojín') || n.includes('cojin') || n.includes('silla')) return '🛋️';
    if (n.includes('foco') || n.includes('luz') || n.includes('luces')) return '💡';
    if (c.includes('hogar')) return '🏠';

    if (n.includes('mascota') || n.includes('cepillo') || n.includes('perro') || n.includes('gato')) return '🐾';
    if (n.includes('libro') || n.includes('coquito') || n.includes('cuaderno') || n.includes('trazos')) return '📚';
    if (c.includes('mascota') || c.includes('juguete') || c.includes('librería') || c.includes('libreria')) return '🧸';

    return '🛍️';
  };

  // Offline fallback matchmaking rules
  const getOfflineResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    // 1. HELP / AYUDA
    if (q.includes('ayuda') || q.includes('ayudame') || q.includes('necesito ayuda') || q.includes('como me ayudas')) {
      return `¡Hola! Te ayudo al instante:

• Ver Categorías
• Maquillaje y Belleza
• Recomendaciones
• Medios de Pago

¡Dime qué te interesa y listo!`;
    }

    // 2. SHOW CATEGORIES / MUESTRA CATEGORIAS
    if (q.includes('categoria') || q.includes('secciones') || q.includes('tipo') || q.includes('filtro') || q.includes('categoría') || q.includes('categorias')) {
      return `Categorías CHIO Productos:

1. Belleza y Cuidado Personal 💄
2. Cocina y Hogar 🍳
3. Hogar y Estilo de Vida 🏠
4. Mascotas, Juguetes y Librerías 🐶

¡Selecciónalas en el catálogo para filtrar!`;
    }

    // 3. PAYMENT / MEDIOS DE PAGO
    if (q.includes('pago') || q.includes('yape') || q.includes('plin') || q.includes('transferencia') || q.includes('tarjeta') || q.includes('pagar')) {
      return `Medios de Pago:

• Yape y Plin 📲
• Transferencia Bancaria (BCP, BBVA, Interbank) 🏦
• Efectivo 💵

¡Eliges tu preferido al confirmar el pedido!`;
    }

    // 4. CATEGORY & PRODUCT MATCHING:

    // 4A. MAQUILLAJE / COSMÉTICOS Y BROCHAS ESPECÍFICOS
    if (q.includes('maquillaje') || q.includes('maquillajes') || q.includes('brocha') || q.includes('brochas') || q.includes('ceja') || q.includes('cejas') || q.includes('cosmetico') || q.includes('cosméticos') || q.includes('labial') || q.includes('pincel')) {
      return `Maquillaje y Brochas Estéticas 💄:

• **Set de Brochas para Maquillaje** 🖌️
Precio: S/ 5.00

• **Molde y Tinte para Cejas** 👁️
Precio: S/ 2.00 – S/ 7.00

• **Espejo LED Recargable** 🪞
Precio: S/ 7.00

• **Organizador Joyero y Cosméticos** 💎
Precio: S/ 20.00

• **Perfume Yanbal** 🌸
Precio: S/ 70.00

¡Encuéntralos en Belleza y Cuidado Personal!`;
    }

    // 4B. BELLEZA Y CUIDADO PERSONAL (GENERAL)
    if (q.includes('belleza') || q.includes('cuidado personal') || q.includes('skincare') || q.includes('perfume') || q.includes('espejo') || q.includes('facial') || q.includes('joyero') || q.includes('shampoo') || q.includes('champú')) {
      return `Belleza y Cuidado Personal 💄:

• **Set de Brochas de Maquillaje** 🖌️ — S/ 5.00
• **Espejo LED Recargable** 🪞 — S/ 7.00
• **Molde y Tinte para Cejas** 👁️ — S/ 2.00
• **Perfume Yanbal** 🌸 — S/ 70.00
• **Organizador Joyero** 💎 — S/ 20.00

¡Filtra la categoría en la tienda!`;
    }

    // 4C. COCINA Y HOGAR
    if (q.includes('cocina') || q.includes('taper') || q.includes('taperes') || q.includes('pirex') || q.includes('menaje') || q.includes('refrigeradora') || q.includes('platos')) {
      return `Cocina y Hogar 🍳:

• **5 Taperes de Acero Premium** 🥣 — S/ 10.00
• **Taper Pirex de Vidrio** 🍲 — S/ 11.00
• **Organizadores de Cocina** 🍱 — S/ 12.00

¡Disponibles en la categoría Cocina!`;
    }

    // 4D. HOGAR Y ESTILO DE VIDA / ORGANIZACIÓN
    if (q.includes('hogar') || q.includes('estilo de vida') || q.includes('organizacion') || q.includes('organizador') || q.includes('escritorio') || q.includes('cojin') || q.includes('perchero') || q.includes('foco') || q.includes('decoracion')) {
      return `Hogar y Estilo de Vida 🏠:

• **Organizador de Escritorio de Madera** 🪵 — S/ 20.00
• **Cojín Ergonómico de Silicona** 🛋️ — S/ 16.00
• **Perchero y Luces LED** 💡 — S/ 15.00

¡Disponibles en la sección Hogar!`;
    }

    // 4E. MASCOTAS, JUGUETES Y LIBRERÍAS
    if (q.includes('mascota') || q.includes('mascotas') || q.includes('juguete') || q.includes('juguetes') || q.includes('libreria') || q.includes('librería') || q.includes('cuaderno') || q.includes('coquito') || q.includes('perro') || q.includes('gato') || q.includes('escribir') || q.includes('letra')) {
      return `Mascotas, Juguetes y Librerías 🐶:

• **Cepillo a Vapor para Mascota** 🐾 — S/ 6.00
• **Libro Coquito y Trazos** 📚 — S/ 15.00
• **Juguetes e Higiene** 🎁 — S/ 8.00

¡Encuéntralos en la sección Mascotas y Librería!`;
    }

    // 5. "RECOMIÉNDAME ALGO" / "RECOMIENDA" / "SUGERENCIAS"
    if (q.includes('recomiendame') || q.includes('recomienda') || q.includes('sugerencia') || q.includes('sugerencias') || q.includes('que me recomiendas')) {
      return `Recomendaciones Top:

• **Set de Brochas de Maquillaje** 🖌️ — S/ 5.00
• **5 Taperes de Acero Premium** 🥣 — S/ 10.00
• **Organizador de Escritorio** 🪵 — S/ 20.00
• **Cepillo a Vapor Mascotas** 🐾 — S/ 6.00

¿Cuál te interesa probar hoy?`;
    }

    // Try finding catalog products matching query words strictly
    const keywords = q.split(/\s+/).filter(w => w.length > 2);
    if (keywords.length > 0) {
      const matches = productsData.filter(p => 
        keywords.some(kw => 
          p.name.toLowerCase().includes(kw) || 
          p.category.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw)
        )
      );

      if (matches.length > 0) {
        const selectedMatches = matches.slice(0, 4);
        let resp = `🛍️ Opciones encontradas:\n\n`;
        selectedMatches.forEach((prod) => {
          const emoji = getProductEmoji(prod.name, prod.category);
          resp += `• **${prod.name}** ${emoji}\nPrecio: S/ ${prod.price.toFixed(2)}\n\n`;
        });
        return resp.trim();
      }
    }

    // Friendly short default response
    return `¡Hola! ¿Qué estás buscando hoy?

Dime el producto o categoría y Chío te da nombres y precios al instante.`;
  };

  const handleSendMessageText = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulated short delay for natural typing feel
    setTimeout(() => {
      const replyText = getOfflineResponse(textToSend);
      const chiolyReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'chioly',
        text: replyText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, chiolyReply]);
      setIsTyping(false);
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessageText(inputValue);
  };

  const renderMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;
      
      // Basic bold parsing **text**
      const parts = formatted.split(/(\*\*.*?\*\*)/g);
      
      return (
        <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3">
          {showNotification && (
            <div className="hidden sm:flex bg-white text-gray-800 text-xs font-bold px-3 py-2 rounded-2xl shadow-xl border border-amber-200 animate-bounce items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>¡Hola! Soy Chío 🌸 ¿Te ayudo?</span>
              <button 
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-black ml-1"
              >
                ×
              </button>
            </div>
          )}
          
          <button
            onClick={() => setIsOpen(true)}
            className="group relative bg-gradient-to-r from-[#FDB913] via-amber-400 to-[#FDB913] text-black p-3.5 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center border-2 border-white/80 ring-4 ring-amber-400/20"
            title="Chío Asesora Virtual"
          >
            <div className="relative">
              <span className="text-xl">🌸</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-black uppercase tracking-wider pl-0 group-hover:pl-2">
              Hablar con Chío
            </span>
          </button>
        </div>
      )}

      {/* Chat Box Popup Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 overflow-hidden ${
            isMinimized ? 'h-[64px]' : 'h-[520px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white p-3.5 px-4 flex items-center justify-between shadow-md shrink-0 border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#FDB913] to-amber-500 flex items-center justify-center text-black font-black text-base shadow-sm ring-2 ring-white/20">
                🌸
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-gray-900 rounded-full"></span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-wide text-white">Chío</h3>
                  <span className="bg-[#FDB913] text-black text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md">
                    IA CHIO
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Asesora en línea
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                title={isMinimized ? "Expandir" : "Minimizar"}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                title="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Conversation Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-amber-500/5 via-white to-gray-50/50 text-xs">
                {messages.map((msg) => {
                  const isChioly = msg.sender === 'chioly';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2.5 ${isChioly ? 'items-start' : 'items-end justify-end'}`}
                    >
                      {isChioly && (
                        <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xs shrink-0 shadow-sm mt-0.5">
                          🌸
                        </div>
                      )}
                      
                      <div className="flex flex-col max-w-[82%]">
                        <div 
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            isChioly 
                              ? 'bg-gradient-to-br from-white to-gray-50 text-gray-800 rounded-tl-none border border-gray-100' 
                              : 'bg-black text-white rounded-br-none'
                          }`}
                        >
                          {renderMessageText(msg.text)}
                        </div>
                        <span className={`text-[9px] mt-1 ${isChioly ? 'text-gray-400 ml-1' : 'text-gray-450 text-right mr-1'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-gray-400 text-[11px] pl-1">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">🌸</div>
                    <div className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-2xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                
                <div ref={messageEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
                <button 
                  onClick={() => handleQuickAction("Muestra categorías")}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full border border-amber-200 transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  🧺 Ver Categorías
                </button>
                <button 
                  onClick={() => handleQuickAction("Recomiéndame algo")}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full border border-purple-200 transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  🌸 Recomiéndame algo
                </button>
                <button 
                  onClick={() => handleQuickAction("¿Qué medios de pago aceptan?")}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200 transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  💳 Medios de pago
                </button>
              </div>

              {/* Message Input Form */}
              <form 
                onSubmit={handleFormSubmit}
                className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Dime qué necesitas y Chío te ayuda..."
                  className="flex-1 bg-gray-50 border border-gray-250 hover:border-gray-300 focus:border-[#FDB913] focus:ring-1 focus:ring-[#FDB913] text-sm px-4 py-2.5 rounded-2xl outline-none transition-colors text-black"
                />
                
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="p-2.5 bg-[#FDB913] hover:bg-[#e5a60b] text-black font-extrabold rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center justify-center shrink-0"
                  title="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
