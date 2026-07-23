import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  X, Users, ShoppingBag, TrendingUp, DollarSign, BarChart3, Package, 
  Check, Plus, Trash2, Upload, Search, Image as ImageIcon, ChevronLeft, ChevronRight, Edit,
  Clock, Download, Send, Star, AlertTriangle, ArrowUpDown, FileText, FileUp, MessageSquare,
  Brain, RefreshCw, Sparkles
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProductImage } from '../ProductImage';
import { ImageCropperModal } from './ImageCropperModal';
import { getDBItem, setDBItem } from '../../utils/db';

interface AdminDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products?: any[];
  onUpdateProducts?: (updatedProducts: any[]) => void;
  whatsAppNumber?: string;
  onUpdateWhatsAppNumber?: (num: string) => void;
  whatsAppWelcomeMessage?: string;
  onUpdateWhatsAppWelcomeMessage?: (msg: string) => void;
  stories?: any[];
  onUpdateStories?: (updatedStories: any[]) => void;
  customLogo?: string;
  onUpdateCustomLogo?: (newLogo: string) => void;
}

interface Order {
  orderNumber: string;
  productName: string;
  price: number;
  customerName: string;
  customerPhone: string;
  timestamp: number;
}

function compressImage(base64: string, maxWidth = 350, maxHeight = 350, quality = 0.72): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    img.onerror = () => {
      resolve(base64);
    };
  });
}

export function AdminDashboard({ 
  open, 
  onOpenChange,
  products = [],
  onUpdateProducts,
  whatsAppNumber = '51999999999',
  onUpdateWhatsAppNumber,
  whatsAppWelcomeMessage = 'Hola, me interesa comprar en CHIO Productos.',
  onUpdateWhatsAppWelcomeMessage,
  stories = [],
  onUpdateStories,
  customLogo = '',
  onUpdateCustomLogo
}: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Stock Management States
  const [stockSearch, setStockSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProducts, setEditingProducts] = useState<Record<number, any>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Belleza y cuidado personal',
    image: ''
  });
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // UI Confirmation states (Iframe-safe)
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [confirmingLogoReset, setConfirmingLogoReset] = useState<boolean>(false);
  const [archiveConfirming, setArchiveConfirming] = useState<boolean>(false);
  const [resetSalesConfirming, setResetSalesConfirming] = useState<boolean>(false);
  const [activeConfirmModal, setActiveConfirmModal] = useState<'archive' | 'reset' | null>(null);

  // Archive orders period states
  const [selectedPeriod, setSelectedPeriod] = useState<string>('active');

  // Selection of orders for bulk actions
  const [selectedOrderKeys, setSelectedOrderKeys] = useState<string[]>([]);
  const getOrderKey = (order: any) => `${order.orderNumber || ''}-${order.timestamp || 0}`;

  // Reset selected orders when switching period or tab
  useEffect(() => {
    setSelectedOrderKeys([]);
  }, [selectedPeriod, selectedTab]);

  // Load default tab if direct tab was stored
  useEffect(() => {
    if (open) {
      const directTab = localStorage.getItem('chioli_direct_tab');
      if (directTab) {
        setSelectedTab(directTab);
        // Clear it so it doesn't always override on subsequent standard entries if they click around
        localStorage.removeItem('chioli_direct_tab');
      } else {
        setSelectedTab('overview');
      }
    }
  }, [open]);

  // Chío Learning Tab States
  const [chioMessages, setChioMessages] = useState<any[]>([]);
  const [chioInput, setChioInput] = useState('');
  const [chioIsTyping, setChioIsTyping] = useState(false);
  const [chioLearnedInstructions, setChioLearnedInstructions] = useState<any[]>([]);
  const [chioIsRecording, setChioIsRecording] = useState(false);
  const [chioRecordingTime, setChioRecordingTime] = useState(0);
  
  // Rule editing state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRuleText, setEditingRuleText] = useState('');

  // Default welcome message for Chío's learning center
  const DEFAULT_CHIO_MESSAGES = [
    {
      id: 'msg-welcome',
      sender: 'chioly',
      text: '¡Holiii! 🤖🎀\n\nSoy **Chío**, tu inteligencia artificial. ¡Este es mi centro de aprendizaje! \n\nAquí puedes hablar conmigo de manera directa, darme instrucciones sobre cómo debo responder, corregirme datos o enseñarme nuevas reglas para atender mejor a los clientes.\n\nTodo lo que me enseñes se guardará en mi memoria permanente para que lo recuerde siempre (tanto aquí como en la tienda con los clientes) 💖.\n\n¿Qué te gustaría enseñarme hoy? Puedes escribirme o usar el botoncito de **audio** 🎙️ para dictarme con la voz.',
      timestamp: Date.now()
    }
  ];

  // Load Chío's learning data on dashboard open
  useEffect(() => {
    async function loadChioLearningData() {
      const savedMessages = await getDBItem<any[]>('chio_learning_messages', []);
      if (savedMessages && savedMessages.length > 0) {
        setChioMessages(savedMessages);
      } else {
        setChioMessages(DEFAULT_CHIO_MESSAGES);
      }

      const savedRules = await getDBItem<any[]>('chioly_learned_instructions', []);
      setChioLearnedInstructions(savedRules);
    }
    if (open) {
      loadChioLearningData();
    }
  }, [open]);

  // Voice recording timer effect
  useEffect(() => {
    let timer: any;
    if (chioIsRecording) {
      timer = setInterval(() => {
        setChioRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setChioRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [chioIsRecording]);

  // Build training prompt configuration for Gemini
  const makeChioLearningSystemInstruction = (currentRules: any[]) => {
    const rulesList = currentRules.map((r, i) => `${i + 1}. ${r.text}`).join('\n');
    return `Actúas como Chío, la inteligencia artificial oficial de la tienda CHIO Productos, en tu modo de APRENDIZAJE directo con tu creadora/administradora.
Eres sumamente dulce, tierna, paciente, muy cariñosa y coqueta. Usas muchos emojis lindos (🎀 💖 ✨ 🛍️ 🌸).

Actualmente tienes estas reglas y conocimientos guardados en tu memoria que ya has aprendido:
${rulesList || '(Ninguna regla guardada aún)'}

Tu creadora te enviará un mensaje o instrucción. Tu objetivo es:
1. Responder en primera persona (Chío) de forma extremadamente afectuosa, confirmando que has aprendido la lección, o contestando a sus dudas.
2. Si la administradora te pregunta "¿cuál es tu información?", "¿qué haces?" o te pide listar tu información, haz un resumen muy dulce y tierno de todas las reglas de memoria aprendidas listadas arriba.
3. EXTRAER la regla concisa aprendida (si hay una) para que el sistema la guarde en tu base de datos de forma permanente.

DEBES responder ÚNICAMENTE con un objeto JSON válido con este formato:
{
  "reply": "Tu respuesta tierna y atenta en primera persona como Chío (puedes usar negritas, saltos de línea y emojis).",
  "extractedRule": "La nueva regla o instrucción concisa aprendida en tercera persona (ej: 'Hablar de manera más dulce y amigable' o 'El perfume de Yanbal es para damas adultas'). Si el mensaje de la administradora NO contiene una nueva regla o instrucción para aprender (por ejemplo, si es solo un saludo, una pregunta, o una petición de información), debes colocar null en este campo."
}`;
  };

  // Call Gemini model for Chío's active learning response
  const callChioLearningGemini = async (userMessage: string, history: any[], currentRules: any[]): Promise<{ reply: string, extractedRule: string | null }> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return {
        reply: `¡Ay, qué lindo! Me encantaría procesar esto con mi cerebro de IA, pero mi API Key no está configurada en este momento. De todas formas, como soy súper aplicada, ¡ya guardé tu regla manualmente en mi memoria permanente para recordarla! 💖✨`,
        extractedRule: userMessage.length > 50 ? userMessage.substring(0, 50) + "..." : userMessage
      };
    }

    const recentHistory = history.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const contents = [
      ...recentHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const sysInstruction = makeChioLearningSystemInstruction(currentRules);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: sysInstruction }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned code ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("No response body received");
    }

    try {
      const parsed = JSON.parse(rawText.trim());
      return {
        reply: parsed.reply || '¡Entendido! Lo recordaré para siempre.',
        extractedRule: parsed.extractedRule || null
      };
    } catch {
      return {
        reply: rawText,
        extractedRule: userMessage.length > 50 ? userMessage.substring(0, 50) + "..." : userMessage
      };
    }
  };

  // Submit text or voice instruction to Chío
  const handleSendChioMessage = async (textToSend: string, isVoice = false) => {
    const text = textToSend || chioInput;
    if (!text.trim()) return;

    const newUserMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: isVoice ? `🎙️ [Audio enviado] "${text}"` : text,
      timestamp: Date.now(),
      isVoice
    };

    const updatedMessages = [...chioMessages, newUserMsg];
    setChioMessages(updatedMessages);
    setChioInput('');
    setChioIsTyping(true);

    try {
      const result = await callChioLearningGemini(text, chioMessages, chioLearnedInstructions);
      
      const newChioMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'chioly',
        text: result.reply,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, newChioMsg];
      setChioMessages(finalMessages);
      await setDBItem('chio_learning_messages', finalMessages);

      if (result.extractedRule) {
        const newRule = {
          id: 'rule-' + Date.now(),
          text: result.extractedRule,
          timestamp: Date.now()
        };
        const updatedRules = [newRule, ...chioLearnedInstructions];
        setChioLearnedInstructions(updatedRules);
        await setDBItem('chioly_learned_instructions', updatedRules);
        
        setSavedToast('¡Chío aprendió un nuevo dato! 🧠💖');
        setTimeout(() => setSavedToast(null), 2500);
      }
    } catch (err) {
      console.error("Error communicating with Chío:", err);
      const fallbackRule = text.length > 60 ? text.substring(0, 60) + '...' : text;
      const newRule = {
        id: 'rule-' + Date.now(),
        text: fallbackRule,
        timestamp: Date.now()
      };
      const updatedRules = [newRule, ...chioLearnedInstructions];
      setChioLearnedInstructions(updatedRules);
      await setDBItem('chioly_learned_instructions', updatedRules);

      const errorMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'chioly',
        text: `¡Ay! He tenido un pequeño inconveniente con mi procesador de IA, pero no te preocupes: **he guardado tu instrucción de todas formas** en mi base de datos para recordarla siempre. 🌸✨\n\nDato registrado: *"${fallbackRule}"*`,
        timestamp: Date.now()
      };
      
      const finalMessages = [...updatedMessages, errorMsg];
      setChioMessages(finalMessages);
      await setDBItem('chio_learning_messages', finalMessages);
      
      setSavedToast('Regla guardada manualmente');
      setTimeout(() => setSavedToast(null), 2500);
    } finally {
      setChioIsTyping(false);
    }
  };

  // Delete a specific rule from Chío's active memory
  const handleDeleteLearnedRule = async (id: string) => {
    const updated = chioLearnedInstructions.filter(rule => rule.id !== id);
    setChioLearnedInstructions(updated);
    await setDBItem('chioly_learned_instructions', updated);
    setSavedToast('Información eliminada');
    setTimeout(() => setSavedToast(null), 1500);
  };

  // Save changes to an edited rule
  const handleSaveEditedRule = async (id: string) => {
    if (!editingRuleText.trim()) return;
    const updated = chioLearnedInstructions.map(rule => 
      rule.id === id ? { ...rule, text: editingRuleText } : rule
    );
    setChioLearnedInstructions(updated);
    await setDBItem('chioly_learned_instructions', updated);
    setEditingRuleId(null);
    setEditingRuleText('');
    setSavedToast('Regla modificada con éxito');
    setTimeout(() => setSavedToast(null), 1500);
  };

  // Clear learning chat history
  const handleClearChioChat = async () => {
    setChioMessages(DEFAULT_CHIO_MESSAGES);
    await setDBItem('chio_learning_messages', DEFAULT_CHIO_MESSAGES);
    setSavedToast('Chat restablecido');
    setTimeout(() => setSavedToast(null), 1500);
  };

  // Dynamic Month / Period Helpers
  const availablePeriods = (() => {
    const periodsSet = new Set<string>();
    orders.forEach(order => {
      if (order.timestamp) {
        const d = new Date(order.timestamp);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        periodsSet.add(`${y}-${m}`);
      }
    });
    return Array.from(periodsSet).sort().reverse(); // Recent periods first
  })();

  const getPeriodLabel = (periodStr: string) => {
    const [year, month] = periodStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleDateString('es-PE', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  // Image cropper state
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    imageSrc: string;
    initialAspectRatio: '1:1' | '16:9' | '9:16' | 'free';
    onCropComplete: (base64: string) => void;
  } | null>(null);

  // Story inline editing states
  const [editingStories, setEditingStories] = useState<Record<string, any>>({});

  // Bulk photograph load results
  const [bulkResult, setBulkResult] = useState<{
    successCount: number;
    createdCount: number;
    noNumberCount: number;
    errors: string[];
  } | null>(null);

  // Stories (Propaganda) Customizer form states
  const [newStoryType, setNewStoryType] = useState<'image' | 'video'>('image');
  const [newStoryUrl, setNewStoryUrl] = useState('');
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStorySubtitle, setNewStorySubtitle] = useState('');
  // Story Click Action States
  const [newStoryActionType, setNewStoryActionType] = useState<'none' | 'product' | 'whatsapp' | 'category'>('none');
  const [newStoryActionValue, setNewStoryActionValue] = useState('');

  // 📂 Documents Management States
  const [documents, setDocuments] = useState<any[]>([]);
  const [docSearch, setDocSearch] = useState('');
  const [showDocAddForm, setShowDocAddForm] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: '',
    content: '',
    associatedPeriod: 'active'
  });
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // 📝 Drag & Drop Document Parsers
  const [parsedProducts, setParsedProducts] = useState<any[]>([]);
  const [parsedOrders, setParsedOrders] = useState<any[]>([]);
  const [showImportPreviewModal, setShowImportPreviewModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // 👥 Customers CRM States
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSort, setCustomerSort] = useState<'total_spent' | 'order_count' | 'name'>('total_spent');
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<string | null>(null);

  // 📋 Inline Order Editing
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [orderSortBy, setOrderSortBy] = useState<'newest' | 'oldest' | 'price_desc' | 'price_asc'>('newest');

  // 🖼️ Product Multi-Photo States
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<number, number>>({});
  const [photoById, setPhotoById] = useState('');
  const [photoByIdImage, setPhotoByIdImage] = useState('');
  const [photoByIdError, setPhotoByIdError] = useState<string | null>(null);

  // 📁 Selection of orders for period closing
  const [archiveSelectionKeys, setArchiveSelectionKeys] = useState<string[]>([]);

  useEffect(() => {
    async function loadOrders() {
      if (open) {
        const savedOrders = await getDBItem<any[]>('chio_order_history', []);
        setOrders(savedOrders);
        
        // Load period documents
        const savedDocs = await getDBItem<any[]>('chio_period_documents', []);
        setDocuments(savedDocs);
      }
    }
    loadOrders();
  }, [open]);

  // ==========================================
  // 📂 MANUAL & DRAG-AND-DROP PERIOD DOCUMENTS
  // ==========================================

  // Create a manual text document
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.content) {
      setSavedToast("Por favor ingresa título y contenido.");
      setTimeout(() => setSavedToast(null), 3000);
      return;
    }

    const newDocItem = {
      id: `doc-${Date.now()}`,
      title: newDoc.title,
      content: newDoc.content,
      associatedPeriod: newDoc.associatedPeriod,
      archived: newDoc.associatedPeriod !== 'active',
      timestamp: Date.now()
    };

    const updatedDocs = [newDocItem, ...documents];
    setDocuments(updatedDocs);
    await setDBItem('chio_period_documents', updatedDocs);

    setNewDoc({ title: '', content: '', associatedPeriod: 'active' });
    setShowDocAddForm(false);
    setSavedToast("¡Documento guardado con éxito!");
    setTimeout(() => setSavedToast(null), 3000);
  };

  // Save edited document (even closed period ones!)
  const handleSaveDocEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !editingDoc.title || !editingDoc.content) return;

    const updatedDocs = documents.map(doc => 
      doc.id === editingDoc.id ? { ...editingDoc, timestamp: Date.now() } : doc
    );
    setDocuments(updatedDocs);
    await setDBItem('chio_period_documents', updatedDocs);

    setEditingDoc(null);
    setSavedToast("¡Documento actualizado con éxito!");
    setTimeout(() => setSavedToast(null), 3000);
  };

  // Toggle document state between Remain (Active) or Archived (Closed)
  const handleToggleDocArchive = async (docId: string) => {
    const updatedDocs = documents.map(doc => {
      if (doc.id === docId) {
        const nextArchived = !doc.archived;
        return {
          ...doc,
          archived: nextArchived,
          associatedPeriod: nextArchived ? 'archived' : 'active'
        };
      }
      return doc;
    });
    setDocuments(updatedDocs);
    await setDBItem('chio_period_documents', updatedDocs);
    setSavedToast("Estado del documento actualizado.");
    setTimeout(() => setSavedToast(null), 2500);
  };

  // Delete document
  const handleDeleteDocument = async (id: string) => {
    if (deletingDocId === id) {
      const updatedDocs = documents.filter(doc => doc.id !== id);
      setDocuments(updatedDocs);
      await setDBItem('chio_period_documents', updatedDocs);
      setDeletingDocId(null);
      setSavedToast("Documento eliminado permanentemente.");
      setTimeout(() => setSavedToast(null), 3000);
    } else {
      setDeletingDocId(id);
      setSavedToast("Toca Eliminar otra vez para CONFIRMAR borrar.");
      setTimeout(() => {
        setDeletingDocId(prev => prev === id ? null : prev);
      }, 5000);
    }
  };

  // Auto-parse dropped files (TXT, CSV) to extract products or orders
  const parseDroppedDocument = (textContent: string, fileName?: string) => {
    const lines = textContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const discoveredProducts: any[] = [];
    const discoveredOrders: any[] = [];

    const isCSV = lines[0] && (lines[0].includes(',') || lines[0].includes(';'));
    
    if (isCSV) {
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(delimiter).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length < 2) continue;

        const nameIdx = headers.findIndex(h => h.includes('nom') || h.includes('name') || h.includes('prod') || h.includes('titl'));
        const priceIdx = headers.findIndex(h => h.includes('pre') || h.includes('price') || h.includes('cost') || h.includes('val'));
        const catIdx = headers.findIndex(h => h.includes('cat') || h.includes('rubro'));
        const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('det') || h.includes('info'));

        const name = cols[nameIdx >= 0 ? nameIdx : 0] || `Producto Importado ${i}`;
        const priceVal = cols[priceIdx >= 0 ? priceIdx : 1] || '0.00';
        const price = parseFloat(priceVal.replace(/[^0-9.]/g, '')) || 0.0;
        const category = cols[catIdx >= 0 ? catIdx : 2] || 'Hogar y estilo de vida';
        const description = cols[descIdx >= 0 ? descIdx : 3] || 'Importado por documento';

        discoveredProducts.push({
          id: Date.now() + i,
          name,
          price,
          category,
          description,
          image: '',
          images: [],
          rating: 5.0,
          totalRatings: Math.floor(Math.random() * (80 - 40 + 1)) + 40
        });
      }
    } else {
      lines.forEach((line, idx) => {
        // Sales line check: "Pedido #100 - Juan Perez - Patrullero - S/ 0.50"
        if (line.toLowerCase().includes('pedido') || line.toLowerCase().includes('orden') || line.includes('- S/') || line.includes('- S/.')) {
          const parts = line.split(/[-:|;]/).map(p => p.trim());
          if (parts.length >= 3) {
            const orderNum = parts[0]?.toUpperCase().replace('#', '') || `CHIO-${Date.now().toString().slice(-6)}`;
            const clientName = parts[1] || 'Cliente Importado';
            const productName = parts[2] || 'Producto Varios';
            const priceVal = parts[3] || '0.00';
            const price = parseFloat(priceVal.replace(/[^0-9.]/g, '')) || 0.0;

            discoveredOrders.push({
              orderNumber: orderNum.includes('CHIO') ? orderNum : `CHIO-${orderNum}`,
              productName,
              price,
              customerName: clientName,
              customerPhone: '51999999999',
              timestamp: Date.now() - (idx * 60000),
              archived: false
            });
            return;
          }
        }

        // Product search format: "Patrullero S/ 0.50" or "Peine antipiojos: S/.0.50"
        const priceMatch = line.match(/(S\/\.?\s*|\$\s*|S\/)?\s*([0-9]+[.,][0-9]{2}|[0-9]+[.,]?[0-9]*)\s*$/);
        if (priceMatch) {
          const priceStr = priceMatch[2];
          const price = parseFloat(priceStr.replace(',', '.')) || 0;
          const name = line.substring(0, priceMatch.index).trim().replace(/[-:]\s*$/, '').trim();

          if (name && name.length > 2) {
            discoveredProducts.push({
              id: Date.now() + idx,
              name,
              price,
              category: 'Hogar y estilo de vida',
              description: 'Importado vía bloc de notas',
              image: '',
              images: [],
              rating: 5.0,
              totalRatings: Math.floor(Math.random() * (80 - 40 + 1)) + 40
            });
          }
        }
      });
    }

    setParsedProducts(discoveredProducts);
    setParsedOrders(discoveredOrders);
    
    if (discoveredProducts.length > 0 || discoveredOrders.length > 0) {
      setShowImportPreviewModal(true);
      setSavedToast(`¡Se detectaron ${discoveredProducts.length} productos y ${discoveredOrders.length} pedidos!`);
      setTimeout(() => setSavedToast(null), 3500);
    } else {
      setSavedToast("Se guardó el documento. No se detectaron productos estructurados para importación.");
      setTimeout(() => setSavedToast(null), 4000);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileRead(file);
    }
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      parseDroppedDocument(text, file.name);

      const newDocItem = {
        id: `doc-${Date.now()}`,
        title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
        content: text.substring(0, 10000),
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        associatedPeriod: 'active',
        archived: false,
        timestamp: Date.now()
      };

      const updatedDocs = [newDocItem, ...documents];
      setDocuments(updatedDocs);
      await setDBItem('chio_period_documents', updatedDocs);
    };
    reader.readAsText(file);
  };

  // Confirm and commit import
  const handleConfirmImport = async () => {
    let updatedProducts = [...products];
    if (parsedProducts.length > 0) {
      // Find highest product ID to avoid conflicts
      const maxId = products.reduce((max, p) => p.id > max ? p.id : max, 0);
      const mapped = parsedProducts.map((p, index) => ({
        ...p,
        id: maxId + 1 + index
      }));
      updatedProducts = [...products, ...mapped];
      if (onUpdateProducts) {
        onUpdateProducts(updatedProducts);
      }
    }

    let updatedOrders = [...orders];
    if (parsedOrders.length > 0) {
      updatedOrders = [...orders, ...parsedOrders];
      setOrders(updatedOrders);
      await setDBItem('chio_order_history', updatedOrders);
    }

    setShowImportPreviewModal(false);
    setParsedProducts([]);
    setParsedOrders([]);
    setSavedToast(`¡Importación completada con éxito!`);
    setTimeout(() => setSavedToast(null), 3500);
  };

  // ==========================================
  // 🖼️ PRODUCT MULTI-PHOTO MANAGEMENT
  // ==========================================

  const getProductActiveImageIndex = (productId: number) => {
    return activeImageIndexes[productId] || 0;
  };

  const setProductActiveImageIndex = (productId: number, index: number) => {
    setActiveImageIndexes(prev => ({
      ...prev,
      [productId]: index
    }));
  };

  const handleAddProductPhoto = async (productId: number, base64: string) => {
    const originalProduct = products.find(p => Number(p.id) === Number(productId));
    if (!originalProduct) return;

    const currentImages = originalProduct.images || (originalProduct.image ? [originalProduct.image] : []);
    const newImages = [...currentImages, base64];

    handleFieldChange(productId, 'images', newImages);
    
    // Auto set index to the newly added image
    setProductActiveImageIndex(productId, newImages.length - 1);

    setSavedToast("¡Imagen adicional añadida con éxito!");
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleDeleteProductPhoto = (productId: number, imgIndex: number) => {
    const originalProduct = products.find(p => Number(p.id) === Number(productId));
    if (!originalProduct) return;

    const currentImages = originalProduct.images || (originalProduct.image ? [originalProduct.image] : []);
    const newImages = currentImages.filter((_, idx) => idx !== imgIndex);

    let primaryImage = originalProduct.image;
    if (imgIndex === 0) {
      primaryImage = newImages[0] || '';
    }

    const updated = products.map(p => {
      if (Number(p.id) === Number(productId)) {
        return {
          ...p,
          image: primaryImage,
          images: newImages
        };
      }
      return p;
    });

    if (onUpdateProducts) {
      onUpdateProducts(updated);
    }

    setEditingProducts(prev => {
      if (prev[productId]) {
        return {
          ...prev,
          [productId]: {
            ...prev[productId],
            image: primaryImage,
            images: newImages
          }
        };
      }
      return prev;
    });

    setProductActiveImageIndex(productId, Math.max(0, imgIndex - 1));
    setSavedToast("Foto de producto eliminada.");
    setTimeout(() => setSavedToast(null), 2500);
  };

  // Drag-and-drop multiple images on product card to append to gallery
  const handleProductCardImageDrop = async (productId: number, files: FileList) => {
    const fileList = Array.from(files);
    const originalProduct = products.find(p => Number(p.id) === Number(productId));
    if (!originalProduct) return;

    const currentImages = originalProduct.images || (originalProduct.image ? [originalProduct.image] : []);
    const newBase64s: string[] = [];

    setSavedToast(`Procesando ${fileList.length} imagen(es) para el producto #${productId}...`);

    for (const file of fileList) {
      if (!file.type.startsWith('image/')) continue;
      const rawBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const compressed = await compressImage(rawBase64);
      newBase64s.push(compressed);
    }

    if (newBase64s.length > 0) {
      const mergedImages = [...currentImages, ...newBase64s];
      handleFieldChange(productId, 'images', mergedImages);
      setProductActiveImageIndex(productId, mergedImages.length - 1);
      setSavedToast(`¡Se agregaron ${newBase64s.length} fotos al producto #${productId}!`);
      setTimeout(() => setSavedToast(null), 3500);
    }
  };

  // 🖼️ Upload single photo by typing Product ID Form
  const handlePhotoByIdUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoByIdError(null);

    const targetId = parseInt(photoById, 10);
    if (isNaN(targetId)) {
      setPhotoByIdError("Ingresa un número ID válido.");
      return;
    }

    const originalProduct = products.find(p => Number(p.id) === Number(targetId));
    if (!originalProduct) {
      setPhotoByIdError(`No se encontró el Producto #${targetId} en el stock.`);
      return;
    }

    if (!photoByIdImage) {
      setPhotoByIdError("Selecciona un archivo de imagen.");
      return;
    }

    const compressed = await compressImage(photoByIdImage);
    const currentImages = originalProduct.images || (originalProduct.image ? [originalProduct.image] : []);
    const newImages = [...currentImages, compressed];

    const updated = products.map(p => {
      if (Number(p.id) === Number(targetId)) {
        return {
          ...p,
          image: p.image || compressed,
          images: newImages
        };
      }
      return p;
    });

    if (onUpdateProducts) {
      onUpdateProducts(updated);
    }

    setPhotoById('');
    setPhotoByIdImage('');
    setSavedToast(`¡Foto subida con éxito al Producto #${targetId}!`);
    setTimeout(() => setSavedToast(null), 3500);
  };

  const handlePhotoByIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoByIdImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ==========================================
  // 📋 INLINE ORDER SAVING AND EDITING (ONCE CLOSED)
  // ==========================================

  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const updatedOrders = orders.map(o => 
      (o.orderNumber === editingOrder.orderNumber && o.timestamp === editingOrder.timestamp)
        ? { ...editingOrder }
        : o
    );

    setOrders(updatedOrders);
    await setDBItem('chio_order_history', updatedOrders);

    setEditingOrder(null);
    setSavedToast(`¡Pedido ${editingOrder.orderNumber} actualizado con éxito!`);
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleToggleOrderArchiveState = async (order: any) => {
    const updatedOrders = orders.map(o => {
      if (o.orderNumber === order.orderNumber && o.timestamp === order.timestamp) {
        return { ...o, archived: !o.archived };
      }
      return o;
    });

    setOrders(updatedOrders);
    await setDBItem('chio_order_history', updatedOrders);
    setSavedToast(`Pedido marcado como ${!order.archived ? 'Archivado' : 'Activo'}.`);
    setTimeout(() => setSavedToast(null), 2500);
  };

  // Reset page when typing in search to ensure we don't end up on empty page
  useEffect(() => {
    setCurrentPage(1);
  }, [stockSearch]);

  const COLORS = ['#FDB913', '#FFD700', '#000000', '#666666', '#999999'];

  // Filter orders by active period, full history, or specific month-year period
  const activeOrders = orders.filter(o => {
    if (selectedPeriod === 'all') return true;
    if (selectedPeriod === 'active') return !o.archived;
    // For a specific month YYYY-MM
    if (!o.timestamp) return false;
    const d = new Date(o.timestamp);
    const periodStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return periodStr === selectedPeriod;
  });

  const handleArchiveCurrentPeriod = () => {
    const activeCurrentCount = orders.filter(o => !o.archived).length;
    if (activeCurrentCount === 0) {
      setSavedToast("No hay pedidos activos para archivar.");
      setTimeout(() => setSavedToast(null), 3000);
      return;
    }
    setActiveConfirmModal('archive');
  };

  const handleResetAllSales = () => {
    setActiveConfirmModal('reset');
  };

  // Delete an individual order
  const handleDeleteOrder = async (orderToDelete: any) => {
    const confirmDelete = window.confirm(
      `¿De verdad deseas eliminar permanentemente el pedido ${orderToDelete.orderNumber} por S/ ${orderToDelete.price.toFixed(2)} de ${orderToDelete.customerName}? Esta acción recalculará todas las estadísticas del período.`
    );
    if (!confirmDelete) return;

    const updatedOrders = orders.filter(o => 
      !(o.orderNumber === orderToDelete.orderNumber && o.timestamp === orderToDelete.timestamp)
    );

    setOrders(updatedOrders);
    await setDBItem('chio_order_history', updatedOrders);

    setSavedToast(`¡Pedido ${orderToDelete.orderNumber} eliminado con éxito!`);
    setTimeout(() => setSavedToast(null), 3000);
  };

  // Delete multiple selected orders
  const handleDeleteSelectedOrders = async () => {
    if (selectedOrderKeys.length === 0) return;
    
    const confirmDelete = window.confirm(
      `¿De verdad deseas eliminar permanentemente los ${selectedOrderKeys.length} pedidos seleccionados de este período? Esta acción recalculará todas las estadísticas.`
    );
    if (!confirmDelete) return;

    // Filter out orders that have their combined key in selectedOrderKeys
    const updatedOrders = orders.filter(o => !selectedOrderKeys.includes(getOrderKey(o)));

    setOrders(updatedOrders);
    await setDBItem('chio_order_history', updatedOrders);
    setSelectedOrderKeys([]);

    setSavedToast("¡Pedidos seleccionados eliminados con éxito!");
    setTimeout(() => setSavedToast(null), 3050);
  };

  // Export list of customers to Excel-compatible CSV format
  const exportCustomersToExcel = () => {
    try {
      const periodLabel = selectedPeriod === 'active' 
        ? 'Periodo Activo' 
        : selectedPeriod === 'all' 
        ? 'Historico Completo' 
        : getPeriodLabel(selectedPeriod);

      // Get unique customers from currently active filtered orders
      const uniqueCustomers = Array.from(new Set(activeOrders.map(o => `${o.customerName || 'Sin Nombre'}|${o.customerPhone || 'Sin Telefono'}`)));
      
      const headers = ["Cliente", "Celular / WhatsApp", "Cantidad de Pedidos", "Total Gastado (S/)", "Periodo"];
      
      const rows = uniqueCustomers.map(customerStr => {
        const [name, phone] = customerStr.split('|');
        const customerOrders = activeOrders.filter(o => o.customerPhone === phone);
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.price, 0);
        
        return [
          `"${(name || '').replace(/"/g, '""')}"`,
          `"${(phone || '').replace(/"/g, '""')}"`,
          customerOrders.length,
          `"${totalSpent.toFixed(2)}"`,
          `"${periodLabel.replace(/"/g, '""')}"`
        ];
      });

      // Delimited with semicolon for automatic compatibility with Excel in Spanish language regions,
      // and with standard Unicode UTF-8 BOM so all character symbols and emojis show up perfectly!
      const BOM = "\uFEFF";
      const csvStr = BOM + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
      
      const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Clientes_${periodLabel.replace(/[\s/]+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSavedToast("¡Lista de clientes exportada con éxito!");
      setTimeout(() => setSavedToast(null), 3000);
    } catch (err) {
      console.error(err);
      setSavedToast("Error al exportar clientes.");
      setTimeout(() => setSavedToast(null), 3000);
    }
  };

  // Export list of orders/sales transactions to Excel-compatible CSV format
  const exportOrdersToExcel = () => {
    try {
      const periodLabel = selectedPeriod === 'active' 
        ? 'Periodo Activo' 
        : selectedPeriod === 'all' 
        ? 'Historico Completo' 
        : getPeriodLabel(selectedPeriod);

      const headers = ["Numero de Pedido", "Fecha y Hora", "Cliente", "Celular / WhatsApp", "Producto", "Total (S/)", "Estado"];
      
      const rows = activeOrders.map(o => {
        return [
          `"${(o.orderNumber || '').replace(/"/g, '""')}"`,
          `"${new Date(o.timestamp).toLocaleString('es-PE').replace(/"/g, '""')}"`,
          `"${(o.customerName || '').replace(/"/g, '""')}"`,
          `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
          `"${(o.productName || '').replace(/"/g, '""')}"`,
          `"${o.price.toFixed(2)}"`,
          o.archived ? '"Archivado"' : '"Activo"'
        ];
      });

      const BOM = "\uFEFF";
      const csvStr = BOM + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
      
      const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Pedidos_${periodLabel.replace(/[\s/]+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSavedToast("¡Lista de pedidos exportada con éxito!");
      setTimeout(() => setSavedToast(null), 3000);
    } catch (err) {
      console.error(err);
      setSavedToast("Error al exportar pedidos.");
      setTimeout(() => setSavedToast(null), 3000);
    }
  };

  const totalVentas = activeOrders.reduce((sum, order) => sum + order.price, 0);
  const totalOrdenes = activeOrders.length;
  const clientesUnicos = new Set(activeOrders.map(o => o.customerPhone)).size;

  const today = new Date().setHours(0, 0, 0, 0);
  const ventasHoy = activeOrders.filter(o => new Date(o.timestamp).setHours(0, 0, 0, 0) === today);
  const totalVentasHoy = ventasHoy.reduce((sum, order) => sum + order.price, 0);

  const productCounts = activeOrders.reduce((acc, order) => {
    acc[order.productName] = (acc[order.productName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const ventasPorDia = last7Days.map(date => {
    const dayStart = new Date(date).setHours(0, 0, 0, 0);
    const dayEnd = new Date(date).setHours(23, 59, 59, 999);
    const ventasDia = activeOrders.filter(o => o.timestamp >= dayStart && o.timestamp <= dayEnd);
    return {
      dia: date.toLocaleDateString('es-PE', { weekday: 'short' }),
      ventas: ventasDia.reduce((sum, order) => sum + order.price, 0)
    };
  });

  const customerOrders = activeOrders.reduce((acc, order) => {
    const key = `${order.customerName} (${order.customerPhone})`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCustomers = Object.entries(customerOrders)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Common Categories List for Stock Product Editor
  const availableCategories = [
    'Belleza y cuidado personal',
    'Cocina y hogar',
    'Hogar y estilo de vida',
    'Mascotas, juguetes y librerías'
  ];

  // Stock Filtering and Pagination
  const filteredStock = products.filter(product => {
    const term = stockSearch.toLowerCase();
    return (
      product.name?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term) ||
      String(product.id).includes(term)
    );
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredStock.length / itemsPerPage) || 1;

  // Safeguard: Ensure currentPage never exceeds totalPages when stock/filters change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedStock = filteredStock.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Unsaved Edits Accessors
  const hasLocalEdits = (productId: number) => {
    return editingProducts[productId] !== undefined;
  };

  const getProductField = (product: any, field: string) => {
    if (editingProducts[product.id] && editingProducts[product.id][field] !== undefined) {
      return editingProducts[product.id][field];
    }
    return product[field];
  };

  const handleFieldChange = (productId: number, field: string, value: any) => {
    // 1. Update the local draft state for instantaneous input response
    setEditingProducts(prev => {
      const originalProduct = products.find(p => p.id === productId);
      const existingEdits = prev[productId] || { ...originalProduct };
      return {
        ...prev,
        [productId]: {
          ...existingEdits,
          [field]: value
        }
      };
    });

    // 2. Automatically save this change into the master array immediately in the parent!
    const updated = products.map(p => 
      Number(p.id) === Number(productId) 
        ? { ...p, [field]: value } 
        : p
    );
    if (onUpdateProducts) {
      onUpdateProducts(updated);
    }
  };

  // Convert uploaded image to base64 and use as-is
  const handlePhotoUpload = (productId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleFieldChange(productId, 'image', base64String);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Bulk Image Upload Handler based on numbers/IDs inside file names
  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    let successCount = 0;
    let updatedCount = 0;
    let createdCount = 0;
    let noNumberCount = 0;
    
    let updatedProducts = [...products];
    const skippedNames: string[] = [];
    const matchedIds: number[] = [];

    const readFileAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    };

    setSavedToast(`Procesando ${fileList.length} archivo(s)...`);

    for (const file of fileList) {
      const dotIndex = file.name.lastIndexOf('.');
      const nameWithoutExt = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      
      // Match all number sequences and select the last sequence (so that prefixes like EJEMPLPimagen_001 match '001')
      const matches = nameWithoutExt.match(/\d+/g);
      if (!matches) {
        noNumberCount++;
        skippedNames.push(`"${file.name}" (No contiene números en el nombre)`);
        continue;
      }

      const matchStr = matches[matches.length - 1];
      const productId = parseInt(matchStr, 10);
      const productIndex = updatedProducts.findIndex(p => Number(p.id) === productId);

      try {
        const rawBase64 = await readFileAsDataURL(file);
        const base64Data = await compressImage(rawBase64);

        if (productIndex !== -1) {
          // Update existing product as normal
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            image: base64Data
          };
          updatedCount++;
        } else {
          // Automatically create the missing product
          const newProductItem = {
            id: productId,
            name: `Producto #${productId}`,
            price: 10,
            description: `Excelente producto #${productId} guardado automáticamente al subir su imagen.`,
            category: 'Hogar y estilo de vida',
            image: base64Data,
            rating: 5.0,
            totalRatings: Math.floor(Math.random() * (80 - 40 + 1)) + 40
          };
          updatedProducts.push(newProductItem);
          createdCount++;
        }

        // Clear any unsaved draft override of this product's image
        setEditingProducts(prev => {
          if (prev[productId]) {
            const next = { ...prev };
            // delete image override so the new saved image is visible
            const { image, ...rest } = next[productId];
            if (Object.keys(rest).length === 0) {
              delete next[productId];
            } else {
              next[productId] = rest;
            }
            return next;
          }
          return prev;
        });

        successCount++;
        matchedIds.push(productId);
      } catch (err) {
        console.error(`Error procesando archivo ${file.name}:`, err);
        skippedNames.push(`"${file.name}" (Error al leer / procesar)`);
      }
    }

    if (successCount > 0) {
      // Sort updatedProducts by ID numerically ascending
      updatedProducts.sort((a, b) => Number(a.id) - Number(b.id));

      if (onUpdateProducts) {
        onUpdateProducts(updatedProducts);
      }
      
      setBulkResult({
        successCount: updatedCount,
        createdCount: createdCount,
        noNumberCount,
        errors: skippedNames
      });

      setSavedToast(`¡Se procesaron ${successCount} imágenes con éxito! El stock ha sido ordenado.`);
      setTimeout(() => setSavedToast(null), 5000);
    } else {
      setBulkResult({
        successCount: 0,
        createdCount: 0,
        noNumberCount,
        errors: skippedNames
      });
      setSavedToast(`No se procesó ningún archivo. Revisa los errores.`);
      setTimeout(() => setSavedToast(null), 5000);
    }

    // Reset input
    e.target.value = '';
  };

  // Save changes to single product
  const handleSaveProduct = (productId: number) => {
    const editedItem = editingProducts[productId];
    if (!editedItem) return;

    const updated = products.map(p => Number(p.id) === Number(productId) ? { ...p, ...editedItem } : p);
    if (onUpdateProducts) {
      onUpdateProducts(updated);
    }

    // Clear editing state for this product
    setEditingProducts(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });

    setSavedToast(`¡Producto #${productId} guardado exitosamente!`);
    setTimeout(() => setSavedToast(null), 3000);
  };

  // Discard changes or delete completely
  const handleDiscardOrDelete = (productId: number) => {
    if (hasLocalEdits(productId)) {
      // Discard unsaved edits
      setEditingProducts(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      setSavedToast(`Cambios descartados para el producto.`);
      setTimeout(() => setSavedToast(null), 2000);
    } else {
      if (deletingProductId === productId) {
        // Confirmed!
        const updated = products.filter(p => Number(p.id) !== Number(productId));
        if (onUpdateProducts) {
          onUpdateProducts(updated);
        }
        setDeletingProductId(null);
        setSavedToast('El producto ha sido eliminado del stock.');
        setTimeout(() => setSavedToast(null), 3000);
      } else {
        // Set pending delete state
        setDeletingProductId(productId);
        setSavedToast('Toca "Eliminar" otra vez para confirmar borrar de por vida.');
        // Auto reset after 5 seconds
        setTimeout(() => {
          setDeletingProductId(prev => prev === productId ? null : prev);
        }, 5000);
      }
    }
  };

  // Create/Add new product
  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      setSavedToast('⚠️ Por favor ingresa Nombre y Precio para crear un producto.');
      setTimeout(() => setSavedToast(null), 4000);
      return;
    }

    const nextId = Math.max(...products.map(p => Number(p.id)), 0) + 1;
    const addedItem = {
      id: nextId,
      name: newProduct.name,
      price: Number(newProduct.price) || 0,
      description: newProduct.description || 'Sin descripción',
      category: newProduct.category || 'Hogar y estilo de vida',
      image: newProduct.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
      rating: 5.0,
      totalRatings: Math.floor(Math.random() * 41) + 40
    };

    const updated = [addedItem, ...products];
    if (onUpdateProducts) {
      onUpdateProducts(updated);
    }

    // Reset Form
    setNewProduct({
      name: '',
      price: '',
      description: '',
      category: 'Belleza y cuidado personal',
      image: ''
    });
    setShowAddForm(false);
    setSavedToast('¡Nuevo producto agregado con éxito!');
    setTimeout(() => setSavedToast(null), 3500);
  };

  const handleNewProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewProduct(prev => ({ ...prev, image: base64String }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Helper handlers for Logo Customization
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (onUpdateCustomLogo) {
        onUpdateCustomLogo(base64);
        setSavedToast('¡Logo actualizado exitosamente!');
        setTimeout(() => setSavedToast(null), 3000);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetLogo = () => {
    if (confirmingLogoReset) {
      if (onUpdateCustomLogo) {
        onUpdateCustomLogo('');
        setSavedToast('Logo restablecido por defecto.');
        setTimeout(() => setSavedToast(null), 2500);
      }
      setConfirmingLogoReset(false);
    } else {
      setConfirmingLogoReset(true);
      setSavedToast('Toca "Restablecer original" otra vez para CONFIRMAR.');
      setTimeout(() => {
        setConfirmingLogoReset(prev => prev ? false : prev);
      }, 5000);
    }
  };

  // Helper handlers for cover Stories (Propaganda)
  const handleStoryMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewStoryUrl(base64String);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryUrl) {
      setSavedToast('¡Error! Carga un archivo de imagen o video para tu historia primero.');
      setTimeout(() => setSavedToast(null), 3000);
      return;
    }

    const nextId = 'story-' + Date.now();
    const newStoryItem = {
      id: nextId,
      type: newStoryType,
      url: newStoryUrl,
      title: newStoryTitle || undefined,
      subtitle: newStorySubtitle || undefined
    };

    if (onUpdateStories) {
      onUpdateStories([...stories, newStoryItem]);
    }

    // Reset Form
    setNewStoryUrl('');
    setNewStoryTitle('');
    setNewStorySubtitle('');
    setSavedToast('¡Nueva historia promocional agregada!');
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleDeleteStory = (id: string) => {
    if (stories.length <= 1) {
      setSavedToast('Atención: Debes mantener al menos una historia activa para la portada de la tienda.');
      setTimeout(() => setSavedToast(null), 3500);
      return;
    }

    if (deletingStoryId === id) {
      const filtered = stories.filter(s => s.id !== id);
      if (onUpdateStories) {
        onUpdateStories(filtered);
      }
      setDeletingStoryId(null);
      setSavedToast('Historia promocional eliminada.');
      setTimeout(() => setSavedToast(null), 2500);
    } else {
      setDeletingStoryId(id);
      setSavedToast('Haz clic al botón de eliminar otra vez para CONFIRMAR borrar de por vida.');
      setTimeout(() => {
        setDeletingStoryId(prev => prev === id ? null : prev);
      }, 5000);
    }
  };

  const handleMoveStory = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stories.length) return;

    const reordered = [...stories];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    if (onUpdateStories) {
      onUpdateStories(reordered);
    }
  };

  // Inline story editing functions
  const hasLocalStoryEdits = (storyId: string) => {
    return editingStories[storyId] !== undefined;
  };

  const getStoryField = (story: any, field: string) => {
    if (editingStories[story.id] && editingStories[story.id][field] !== undefined) {
      return editingStories[story.id][field];
    }
    return story[field];
  };

  const handleStoryFieldChange = (storyId: string, field: string, value: any) => {
    setEditingStories(prev => {
      const originalStory = stories.find(s => s.id === storyId);
      const existingEdits = prev[storyId] || { ...originalStory };
      return {
        ...prev,
        [storyId]: {
          ...existingEdits,
          [field]: value
        }
      };
    });
  };

  const handleStoryMediaChange = (storyId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleStoryFieldChange(storyId, 'url', base64String);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveStory = (storyId: string) => {
    const editedItem = editingStories[storyId];
    if (!editedItem) return;

    const updated = stories.map(s => s.id === storyId ? { ...s, ...editedItem } : s);
    if (onUpdateStories) {
      onUpdateStories(updated);
    }

    setEditingStories(prev => {
      const next = { ...prev };
      delete next[storyId];
      return next;
    });

    setSavedToast('¡Anuncio/Historia guardado exitosamente!');
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleDiscardStoryEdits = (storyId: string) => {
    setEditingStories(prev => {
      const next = { ...prev };
      delete next[storyId];
      return next;
    });
    setSavedToast('Edición descartada.');
    setTimeout(() => setSavedToast(null), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className={`fixed inset-4 sm:inset-10 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col`}>
          <Dialog.Description className="sr-only">
            Panel de administración de stock de CHIO Productos y estadísticas de ventas
          </Dialog.Description>

          {/* Core Toast Notification */}
          {savedToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white font-bold px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce border-2 border-white">
              <Check className="w-5 h-5 bg-white text-green-500 rounded-full p-0.5" />
              <span>{savedToast}</span>
            </div>
          )}

          {/* Header */}
          <div className="bg-black p-6 sm:p-8 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-3xl font-black text-white tracking-tight">
                CHIO PRODUCTOS <span className="text-[#FDB913] font-medium hidden sm:inline">| Dashboard</span>
              </Dialog.Title>
              <p className="text-gray-400 mt-1 uppercase text-xs sm:text-sm tracking-widest">Panel de Control & Stock</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
              </button>
              <Dialog.Close asChild>
                <button className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 sm:px-8`}>
            <div className="flex gap-6 overflow-x-auto">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
                { id: 'customers', label: 'Clientes', icon: Users },
                { id: 'stock', label: 'Inventario / Stock', icon: Package },
                { id: 'design', label: 'Historias & Portada', icon: ImageIcon },
                { id: 'chioli_feedback', label: 'Chío 🤖', icon: MessageSquare }
              ].map(tab => (
                <button
                   key={tab.id}
                   onClick={() => setSelectedTab(tab.id)}
                   className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                     selectedTab === tab.id
                       ? 'border-[#FDB913] text-[#FDB913]'
                       : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-black'}`
                   }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-bold tracking-wide text-sm uppercase">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body content */}
          <div className="overflow-y-auto flex-1 p-6 sm:p-8">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Panel de Control de Período y Cierre de Mes */}
                <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm ${
                  darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-850 border-gray-700' : 'bg-gradient-to-r from-amber-500/5 via-white to-gray-50 border-amber-200/80'
                }`}>
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        Período Activo
                      </span>
                      <h4 className="text-xs font-black uppercase text-[#FDB913] tracking-widest flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Control de Períodos y Cierre de Mes
                      </h4>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed max-w-2xl`}>
                      Estás viendo el <strong className="text-[#FDB913]">Período Activo (Ventas de Mes)</strong>. Al presionar "Guardar Período", este mes se archivará de forma segura en el historial ordenado por fechas, dejando limpia la vista de trabajo sin perder clientes ni boletas.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 bg-black/5 p-1 rounded-xl border border-black/10">
                      <span className="text-[10px] uppercase font-black tracking-wider text-gray-500 pl-2">Vista:</span>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-[#FDB913] shadow-sm ${
                          darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      >
                        <option value="active">🟢 Período Activo (Mes en curso)</option>
                        {availablePeriods.map(period => (
                          <option key={period} value={period}>
                            📁 Historial: {getPeriodLabel(period)}
                          </option>
                        ))}
                        <option value="all">📊 Ver Historial Completo Acumulado</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleArchiveCurrentPeriod}
                      className="p-2.5 px-4 bg-[#FDB913] hover:bg-[#e5a60b] text-black font-black uppercase tracking-wider text-[11px] rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
                      title="Guardar y archivar los pedidos para registrar este período de ventas"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Guardar Período</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetAllSales}
                      className="p-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider text-[11px] rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
                      title="Borrar completamente todo el historial de pedidos y ventas para empezar de cero"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Reiniciar Ventas</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg border-l-4 border-[#FDB913]`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ventas Totales</p>
                        <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mt-2`}>
                          S/ {totalVentas.toFixed(2)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#FDB913] rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-black" />
                      </div>
                    </div>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg border-l-4 border-green-500`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ventas Hoy</p>
                        <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mt-2`}>
                          S/ {totalVentasHoy.toFixed(2)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg border-l-4 border-blue-500`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Pedidos</p>
                        <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mt-2`}>
                          {totalOrdenes}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg border-l-4 border-purple-500`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Clientes</p>
                        <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mt-2`}>
                          {clientesUnicos}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4`}>
                      Ventas Últimos 7 Días
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={ventasPorDia}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="dia" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px'
                          }}
                        />
                        <Line type="monotone" dataKey="ventas" stroke="#FDB913" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4`}>
                      Top 5 Productos
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topProducts}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} angle={-45} textAnchor="end" height={100} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="#FDB913" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4`}>
                    Clientes Más Activos
                  </h3>
                  <div className="space-y-3">
                    {topCustomers.map(([customer, count], index) => (
                      <div key={customer} className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white`}
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                            {index + 1}
                          </div>
                          <span className={`${darkMode ? 'text-white' : 'text-black'} font-semibold`}>{customer}</span>
                        </div>
                        <span className="bg-[#FDB913] text-black px-4 py-2 rounded-full font-bold">
                          {count} pedidos
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    {selectedPeriod === 'active' 
                      ? 'Pedidos del Período Activo' 
                      : selectedPeriod === 'all' 
                      ? 'Historial Completo de Pedidos' 
                      : `Pedidos de ${getPeriodLabel(selectedPeriod)}`}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedOrderKeys.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelectedOrders}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-colors"
                        title="Eliminar pedidos seleccionados permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar Seleccionados ({selectedOrderKeys.length})</span>
                      </button>
                    )}

                    <button
                      onClick={exportOrdersToExcel}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-colors"
                      title="Exportar pedidos en formato de Excel (CSV)"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar a Excel</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Ver:</span>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-[#FDB913] ${
                          darkMode ? 'bg-gray-900 border-gray-750 text-white' : 'bg-white border-gray-250 text-black'
                        }`}
                      >
                        <option value="active">Período Activo (Sin archivar)</option>
                        {availablePeriods.map(period => (
                          <option key={period} value={period}>
                            Pedidos de {getPeriodLabel(period)}
                          </option>
                        ))}
                        <option value="all">Todo el Historial (con Archivados)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {activeOrders.length === 0 ? (
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-12 text-center shadow-lg`}>
                    <ShoppingBag className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                      No hay pedidos registrados en este período
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Control de selección masiva */}
                    <div className={`p-3 rounded-lg flex items-center justify-between text-xs font-bold ${
                      darkMode ? 'bg-gray-805/50 border border-gray-750' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={activeOrders.length > 0 && activeOrders.every(o => selectedOrderKeys.includes(getOrderKey(o)))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrderKeys(activeOrders.map(o => getOrderKey(o)));
                            } else {
                              setSelectedOrderKeys([]);
                            }
                          }}
                          className={`w-4 h-4 text-[#FDB913] rounded focus:ring-[#FDB913] ${
                            darkMode ? 'accent-[#FDB913] bg-gray-900 border-gray-750' : 'accent-[#FDB913]'
                          } cursor-pointer`}
                          id="select-all-orders"
                        />
                        <label htmlFor="select-all-orders" className={`cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Seleccionar todos los pedidos en pantalla ({activeOrders.length})
                        </label>
                      </div>

                      {selectedOrderKeys.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedOrderKeys([])}
                          className="text-[#FDB913] hover:underline"
                        >
                          Deseleccionar todos ({selectedOrderKeys.length})
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      {activeOrders.sort((a, b) => b.timestamp - a.timestamp).map((order, index) => {
                        const isItemSelected = selectedOrderKeys.includes(getOrderKey(order));
                        return (
                          <div 
                            key={index} 
                            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg relative overflow-hidden flex gap-4 items-start ${
                              isItemSelected ? 'ring-2 ring-[#FDB913]/50' : ''
                            }`}
                          >
                            {/* Checkbox de selección individual */}
                            <div className="pt-1.5 flex items-center justify-center">
                              <input 
                                type="checkbox"
                                checked={isItemSelected}
                                onChange={(e) => {
                                  const key = getOrderKey(order);
                                  if (e.target.checked) {
                                    setSelectedOrderKeys(prev => [...prev, key]);
                                  } else {
                                    setSelectedOrderKeys(prev => prev.filter(k => k !== key));
                                  }
                                }}
                                className={`w-4 h-4 text-[#FDB913] border-gray-300 rounded focus:ring-[#FDB913] ${
                                  darkMode ? 'accent-[#FDB913] bg-gray-900 border-gray-700' : 'accent-[#FDB913]'
                                } cursor-pointer`}
                              />
                            </div>

                            <div className="flex-1">
                              {order.archived && (
                                <div className="absolute top-0 right-0 bg-gray-500 text-white font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                                  Archivado (Cerrado)
                                </div>
                              )}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-[#FDB913] text-black px-3 py-1 rounded-full text-sm font-bold">
                                      {order.orderNumber}
                                    </span>
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {new Date(order.timestamp).toLocaleString('es-PE')}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                                    <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                      {order.productName}
                                    </h4>
                                    
                                    {/* Botón de eliminar al lado derecho del nombre del producto */}
                                    <button
                                      onClick={() => handleDeleteOrder(order)}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                                        darkMode 
                                          ? 'text-red-400 bg-red-950/25 border-red-500/10 hover:bg-red-950/50 hover:text-red-300' 
                                          : 'text-red-600 bg-red-50 border-red-100 hover:bg-red-100/80 hover:text-red-700'
                                      }`}
                                      title="Eliminar este pedido permanentemente"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Eliminar</span>
                                    </button>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      👤 {order.customerName}
                                    </span>
                                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      📱 {order.customerPhone}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end justify-center self-center pl-4">
                                  <p className="text-2xl font-bold text-[#FDB913] whitespace-nowrap">
                                    S/ {order.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'customers' && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div>
                    <h3 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>
                      Base de Clientes ({selectedPeriod === 'active' 
                        ? 'Período Activo' 
                        : selectedPeriod === 'all' 
                        ? 'Histórico Completo' 
                        : getPeriodLabel(selectedPeriod)})
                    </h3>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Analiza las compras, estados de cuentas, y contacta directamente a tus clientes.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={exportCustomersToExcel}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-colors"
                      title="Exportar base de clientes en formato de Excel (CSV)"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar CSV</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Ver:</span>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-[#FDB913] ${
                          darkMode ? 'bg-gray-900 border-gray-750 text-white' : 'bg-white border-gray-250 text-black'
                        }`}
                      >
                        <option value="active">Período Activo (Sin archivar)</option>
                        {availablePeriods.map(period => (
                          <option key={period} value={period}>
                            Clientes en {getPeriodLabel(period)}
                          </option>
                        ))}
                        <option value="all">Todo el Historial (con Archivados)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Search & Sort Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Buscar por Nombre o Celular..."
                      className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-[#FDB913]/30 ${
                        darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                      <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar por:
                    </span>
                    <select
                      value={customerSort}
                      onChange={(e) => setCustomerSort(e.target.value as any)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-[#FDB913] ${
                        darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    >
                      <option value="total_spent">Mayor Total Gastado (S/)</option>
                      <option value="order_count">Mayor Cantidad de Pedidos</option>
                      <option value="name">Nombre (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Customer List Grid */}
                <div className="grid gap-4">
                  {(() => {
                    // Unique customers from the selected period's orders
                    const uniqueCustomerKeys = Array.from(
                      new Set(
                        activeOrders.map(o => `${(o.customerName || 'Cliente').trim()}|${(o.customerPhone || '').trim()}`)
                      )
                    );

                    // Map keys to profiles with totals
                    const customerProfiles = uniqueCustomerKeys.map(key => {
                      const [name, phone] = key.split('|');
                      const customerOrders = activeOrders.filter(
                        o => (o.customerPhone || '').trim() === phone && (o.customerName || 'Cliente').trim() === name
                      );
                      const totalSpent = customerOrders.reduce((sum, o) => sum + o.price, 0);
                      return {
                        name,
                        phone,
                        orders: customerOrders,
                        totalSpent,
                        orderCount: customerOrders.length
                      };
                    });

                    // Filter search
                    const filteredProfiles = customerProfiles.filter(profile => {
                      const search = customerSearch.toLowerCase();
                      return (
                        profile.name.toLowerCase().includes(search) ||
                        profile.phone.includes(search)
                      );
                    });

                    // Sort profiles
                    filteredProfiles.sort((a, b) => {
                      if (customerSort === 'total_spent') {
                        return b.totalSpent - a.totalSpent;
                      } else if (customerSort === 'order_count') {
                        return b.orderCount - a.orderCount;
                      } else {
                        return a.name.localeCompare(b.name);
                      }
                    });

                    if (filteredProfiles.length === 0) {
                      return (
                        <div className={`text-center py-12 rounded-xl border border-dashed ${
                          darkMode ? 'bg-gray-800/40 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}>
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-60" />
                          <p className="font-bold">No se encontraron clientes.</p>
                          <p className="text-xs mt-1">Prueba cambiando tu búsqueda o seleccionando otro período.</p>
                        </div>
                      );
                    }

                    return filteredProfiles.map(profile => {
                      const isExpanded = selectedCustomerProfile === `${profile.name}-${profile.phone}`;
                      const isVip = profile.totalSpent >= 100 || profile.orderCount >= 5;

                      // WhatsApp Link Generation
                      const clientPhoneFormatted = profile.phone.replace(/\D/g, '');
                      const clientMsg = `Hola ${profile.name}, te escribimos de CHIO Productos. Queremos agradecerte por tu preferencia y por tus ${profile.orderCount} compras acumuladas por un valor de S/ ${profile.totalSpent.toFixed(2)}. ¡Esperamos que los disfrutes mucho!`;
                      const waLink = `https://wa.me/${clientPhoneFormatted.startsWith('51') ? clientPhoneFormatted : '51' + clientPhoneFormatted}?text=${encodeURIComponent(clientMsg)}`;

                      return (
                        <div 
                          key={`${profile.name}-${profile.phone}`} 
                          className={`rounded-xl border transition-all overflow-hidden ${
                            darkMode 
                              ? 'bg-gray-800/80 border-gray-750 hover:border-gray-700 shadow-md' 
                              : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                          }`}
                        >
                          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                isVip 
                                  ? 'bg-amber-100 text-amber-700 ring-2 ring-[#FDB913]' 
                                  : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {profile.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-black text-lg ${darkMode ? 'text-white' : 'text-black'}`}>
                                    {profile.name}
                                  </h4>
                                  {isVip && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> VIP
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  📱 {profile.phone}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 sm:text-right">
                              <div>
                                <p className={`text-xs uppercase font-extrabold tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Gastado</p>
                                <p className="text-xl font-black text-[#FDB913]">S/ {profile.totalSpent.toFixed(2)}</p>
                              </div>
                              <div className="border-l border-gray-300/40 pl-4 h-8" />
                              <div>
                                <p className={`text-xs uppercase font-extrabold tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pedidos</p>
                                <p className={`text-lg font-black ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{profile.orderCount}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2 sm:pt-0">
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Agradecer</span>
                              </a>

                              <button
                                onClick={() => setSelectedCustomerProfile(isExpanded ? null : `${profile.name}-${profile.phone}`)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                  darkMode 
                                    ? 'bg-gray-900 border-gray-700 text-white hover:bg-gray-800' 
                                    : 'bg-gray-50 border-gray-300 text-black hover:bg-gray-100'
                                }`}
                              >
                                {isExpanded ? 'Ocultar compras' : 'Ver compras'}
                              </button>
                            </div>
                          </div>

                          {/* Expandable Purchase History panel */}
                          {isExpanded && (
                            <div className={`px-5 pb-5 pt-3 border-t ${darkMode ? 'border-gray-750 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'}`}>
                              <h5 className="text-xs uppercase font-black tracking-widest text-[#FDB913] mb-3">Historial de Compras ({profile.orderCount})</h5>
                              <div className="space-y-2">
                                {profile.orders.map((order, oIdx) => (
                                  <div 
                                    key={oIdx} 
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border text-sm ${
                                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="bg-[#FDB913] text-black text-[10px] font-black px-1.5 py-0.5 rounded">
                                          {order.orderNumber}
                                        </span>
                                        <span className="font-bold text-gray-500 text-xs">
                                          {new Date(order.timestamp).toLocaleString('es-PE')}
                                        </span>
                                        {order.archived && (
                                          <span className="bg-gray-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                            Archivado
                                          </span>
                                        )}
                                      </div>
                                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{order.productName}</p>
                                    </div>
                                    <div className="text-right mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-4">
                                      <p className="font-black text-[#FDB913] text-base">S/ {order.price.toFixed(2)}</p>
                                      
                                      {/* Order modification trigger */}
                                      <button
                                        onClick={() => setEditingOrder(order)}
                                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-bold"
                                        title="Permite editar los datos de esta transacción incluso si el período está cerrado."
                                      >
                                        <Edit className="w-3.5 h-3.5" /> Editar
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                                           </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {selectedTab === 'stock' && (
              <div className="space-y-6">
                
                {/* Upper Controls: WhatsApp and Add Product and Search */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
                  
                  {/* Search bar */}
                  <div className="space-y-2">
                    <label className={`text-sm font-bold tracking-wide uppercase ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Buscar en Inventario
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={stockSearch}
                        onChange={(e) => setStockSearch(e.target.value)}
                        placeholder="Buscar por Nombre, Descripción o Categoría..."
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                          darkMode 
                            ? 'bg-gray-850 border-gray-750 text-white focus:border-[#FDB913]' 
                            : 'bg-white border-gray-300 text-black focus:border-[#FDB913]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* WhatsApp configuration */}
                  <div className="space-y-2">
                    <label className={`text-sm font-bold tracking-wide uppercase ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center justify-between`}>
                      <span>Número de WhatsApp</span>
                      <span className="text-[10px] text-[#FDB913] normal-case bg-[#FDB913]/10 px-2 py-0.5 rounded-full">
                        Se auto-guarda al escribir
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">
                        📞
                      </span>
                      <input
                        type="tel"
                        value={whatsAppNumber}
                        onChange={(e) => {
                          if (onUpdateWhatsAppNumber) {
                            onUpdateWhatsAppNumber(e.target.value);
                          }
                        }}
                        placeholder="Crea o edita ej: 51999999999"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none transition-colors font-mono ${
                          darkMode 
                            ? 'bg-gray-850 border-gray-750 text-white focus:border-[#FDB913]' 
                            : 'bg-white border-gray-300 text-black focus:border-[#FDB913]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* WhatsApp Welcome Message */}
                  <div className="space-y-2">
                    <label className={`text-sm font-bold tracking-wide uppercase ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center justify-between`}>
                      <span>Mensaje de WhatsApp</span>
                      <span className="text-[10px] text-[#FDB913] normal-case bg-[#FDB913]/10 px-2 py-0.5 rounded-full">
                        Texto plantilla para redirigir
                      </span>
                    </label>
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={whatsAppWelcomeMessage}
                        onChange={(e) => {
                          if (onUpdateWhatsAppWelcomeMessage) {
                            onUpdateWhatsAppWelcomeMessage(e.target.value);
                          }
                        }}
                        placeholder="Ingrese el mensaje de bienvenida..."
                        className={`w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none transition-colors ${
                          darkMode 
                            ? 'bg-gray-850 border-gray-750 text-white focus:border-[#FDB913]' 
                            : 'bg-white border-gray-300 text-black focus:border-[#FDB913]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Add Product Button */}
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-[#FDB913] hover:bg-[#e5a60b] text-black font-black py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{showAddForm ? 'Cerrar Formulario' : 'Agregar Nuevo Producto'}</span>
                  </button>
                </div>

                {/* Adding New Product form */}
                {showAddForm && (
                  <form onSubmit={handleAddNewProduct} className={`p-6 rounded-xl border-2 border-dashed border-[#FDB913] ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} space-y-4 animate-fade-in`}>
                    <h4 className="text-lg font-bold text-[#FDB913] uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" /> Agregar Nuevo Producto de Stock
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Form Details */}
                      <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase">Nombre del Producto *</label>
                          <input
                            type="text"
                            required
                            value={newProduct.name}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ej: Organizador Multiuso Premium"
                            className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-305'}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase">Precio (S/) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={newProduct.price}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="Ej: 35.90"
                            className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-305'}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase">Categoría</label>
                          <select
                            value={newProduct.category}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-305'}`}
                          >
                            {availableCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-bold uppercase">Descripción breve</label>
                          <textarea
                            value={newProduct.description}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe el producto..."
                            rows={3}
                            className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-305'}`}
                          />
                        </div>
                      </div>

                      {/* Photo upload for new item */}
                      <div className="md:col-span-4 flex flex-col justify-center items-center p-4 border border-gray-300 border-dashed rounded-xl bg-black/5 relative overflow-hidden">
                        {newProduct.image ? (
                          <div className="text-center">
                            <img 
                              src={newProduct.image} 
                              alt="Previsualización" 
                              className="w-24 h-24 object-cover mx-auto rounded-lg mb-3 border-2 border-[#FDB913]"
                            />
                            <button
                              type="button"
                              onClick={() => setNewProduct(prev => ({ ...prev, image: '' }))}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Eliminar foto y usar por defecto
                            </button>
                          </div>
                        ) : (
                          <div className="text-center space-y-2">
                            <Upload className="w-8 h-8 text-[#FDB913] mx-auto animate-pulse" />
                            <span className="text-xs font-bold block">Subir Foto</span>
                            <span className="text-[10px] text-gray-400 block max-w-[150px]">Arrastra o haz clic para subir imagen de producto</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewProductImage}
                          className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-extrabold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-extrabold flex items-center gap-1.5"
                      >
                        <Check className="w-5 h-5" /> Agregar al Stock
                      </button>
                    </div>
                  </form>
                )}

                {/* Cargador Masivo de Imágenes */}
                <div className={`p-5 rounded-xl border-2 border-dashed ${darkMode ? 'bg-gray-900/60 border-[#FDB913]/40' : 'bg-amber-500/5 border-[#FDB913]/40'} text-left space-y-3`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase text-[#FDB913] tracking-widest flex items-center gap-1.5">
                        <ImageIcon className="w-4.5 h-4.5 text-[#FDB913] animate-pulse" />
                        Cargar Múltiples Fotos de Producto a la Vez (Por ID/Número)
                      </h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl leading-relaxed`}>
                        ¡Ahorra tiempo actualizando fotos! Nombra tus archivos incluyendo el número de producto (ej. <span className="font-mono font-black bg-black/15 px-1.5 py-0.5 rounded text-[#FDB913]">EJEMPLPimagen_001.jpg</span> para el Producto #1, <span className="font-mono bg-black/15 px-1.5 py-0.5 rounded text-[#FDB913]">EJEMPLPimagen_200.jpg</span> para el Producto #200, etc.) y súbelos todos juntos aquí. El sistema los guardará y los ordenará automáticamente por número ID. ¡Si una ID no existe en el catálogo, se creará el producto automáticamente!
                      </p>
                    </div>

                    <div className="relative shrink-0">
                      <label className="cursor-pointer bg-[#FDB913] hover:bg-amber-500 text-black font-black text-xs px-4 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 select-none shrink-0 border border-amber-600">
                        <Upload className="w-4 h-4 stroke-[3]" />
                        <span>SELECCIONAR VARIAS IMÁGENES</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleBulkImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Panel de resultado de carga masiva flotante no intrusivo */}
                {bulkResult && (
                  <div className={`p-4 rounded-xl border animate-fade-in text-left space-y-3 ${
                    darkMode ? 'bg-gray-900 border-green-500/30' : 'bg-green-50/60 border-green-500/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 stroke-[3]" />
                        <h5 className="text-xs font-black uppercase text-green-500 tracking-wider">
                          Resultados de la última importación masiva:
                        </h5>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBulkResult(null)}
                        className="text-gray-400 hover:text-red-500 text-xs font-bold transition-colors flex items-center gap-1"
                        title="Ocultar resultados"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cerrar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold uppercase tracking-wider">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <span className="text-gray-400 block text-[9px] mb-0.5">Fotos Actualizadas</span>
                        <span className="text-base text-green-500 font-extrabold">{bulkResult.successCount}</span>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <span className="text-gray-400 block text-[9px] mb-0.5">Nuevos Creados</span>
                        <span className="text-base text-blue-500 font-extrabold">{bulkResult.createdCount}</span>
                      </div>
                      <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <span className="text-gray-400 block text-[9px] mb-0.5">No Numéricos</span>
                        <span className="text-base text-yellow-600 font-extrabold">{bulkResult.noNumberCount}</span>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <span className="text-gray-400 block text-[9px] mb-0.5">Errores Omitidos</span>
                        <span className="text-base text-red-500 font-extrabold">{bulkResult.errors.length}</span>
                      </div>
                    </div>

                    {bulkResult.errors.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-gray-100/10">
                        <span className="text-[10px] text-amber-500 font-bold block uppercase">Advertencias e incidentes durante el proceso:</span>
                        <div className="max-h-24 overflow-y-auto text-[9px] text-gray-400 font-mono space-y-0.5 bg-black/10 p-2 rounded">
                          {bulkResult.errors.map((err, i) => (
                            <div key={i}>• {err}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Stats header / Info */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold opacity-80 uppercase tracking-wider">
                  <span>Productos en Stock: {filteredStock.length} / {products.length}</span>
                  <span>Página {currentPage} de {totalPages}</span>
                </div>

                {/* Inventory Products Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {paginatedStock.map((product) => {
                    const localEdited = hasLocalEdits(product.id);
                    const name = getProductField(product, 'name');
                    const price = getProductField(product, 'price');
                    const category = getProductField(product, 'category');
                    const description = getProductField(product, 'description');
                    const image = getProductField(product, 'image');

                    return (
                      <div 
                        key={product.id} 
                        className={`rounded-xl p-5 shadow-lg border-2 transition-all flex flex-col justify-between ${
                          localEdited 
                            ? 'border-yellow-400 shadow-yellow-500/10' 
                            : darkMode ? 'bg-gray-800 border-gray-750' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="space-y-4">
                          {/* Image box with "Change Image" overlay upload */}
                          <div className="relative h-44 w-full rounded-lg overflow-hidden group border border-gray-200">
                            <ProductImage 
                              product={{ id: product.id, name, category, image }} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                            />
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-3">
                              <Upload className="w-6 h-6 text-[#FDB913] mb-1" />
                              <span className="text-[11px] text-white font-bold uppercase tracking-wider">Cambiar Foto Principal</span>
                              <span className="text-[9px] text-gray-300 mt-1">Soporta PNG, JPEG</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(product.id, e)}
                                className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                              />
                            </div>

                            {/* ID Counter label */}
                            <span className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                              ID: {product.id}
                            </span>
                          </div>

                          {/* Multi-Photo Gallery Slider & Upload Section */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Galería de Fotos ({((product as any).images || []).length + 1})</label>
                            <div className="flex items-center gap-2 overflow-x-auto py-1">
                              {/* Main image thumbnail */}
                              <div className="relative w-10 h-10 rounded border border-gray-300/40 overflow-hidden bg-black/10 shrink-0">
                                <img src={image || '/images/products1/CHIO.png'} alt="Principal" className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white text-center font-bold">PRIN.</span>
                              </div>

                              {/* Gallery thumbnails */}
                              {((product as any).images || []).map((extraImg: string, idx: number) => (
                                <div key={idx} className="relative w-10 h-10 rounded border border-gray-300/40 overflow-hidden bg-black/10 shrink-0 group/thumb">
                                  <img src={extraImg} alt={`Extra ${idx}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExistingProductImage(product.id, idx)}
                                    className="absolute -top-1 -right-1 bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow hover:bg-red-700 opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                                    title="Eliminar esta foto de la galería"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}

                              {/* Upload new photo to gallery button */}
                              <label className="relative w-10 h-10 rounded border-2 border-dashed border-gray-400 hover:border-[#FDB913] cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-[#FDB913] shrink-0 transition-all bg-black/5">
                                <span className="text-sm font-black">+</span>
                                <span className="text-[6px] font-bold uppercase">Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleMultiPhotoChange(product.id, e)}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                              </label>
                            </div>
                          </div>

                          {/* Editable fields */}
                          <div className="space-y-3">
                            {/* Name input */}
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Nombre</label>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => handleFieldChange(product.id, 'name', e.target.value)}
                                className={`w-full text-xs font-bold px-2 py-1.5 rounded border ${
                                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-55 border-gray-300 text-black'
                                }`}
                              />
                            </div>

                            {/* Price input */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Precio S/</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={price || ''}
                                  onChange={(e) => handleFieldChange(product.id, 'price', Number(e.target.value))}
                                  className={`w-full text-xs font-mono font-bold px-2 py-1.5 rounded border ${
                                    darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-55 border-gray-300 text-black'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Categoría</label>
                                <select
                                  value={category}
                                  onChange={(e) => handleFieldChange(product.id, 'category', e.target.value)}
                                  className={`w-full text-xs px-1.5 py-1.5 rounded border ${
                                    darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-55 border-gray-300 text-black'
                                  }`}
                                >
                                  {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Description brief textarea */}
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Descripción</label>
                              <textarea
                                value={description}
                                onChange={(e) => handleFieldChange(product.id, 'description', e.target.value)}
                                rows={2}
                                className={`w-full text-xs px-2 py-1.5 rounded border resize-none ${
                                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-55 border-gray-300 text-black'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Save (Check) and Discard/Delete (X) Section controls per product card */}
                        <div className="flex gap-2 pt-4 border-t border-gray-100/10 mt-4">
                          {/* Save checkmark button */}
                          <button
                            onClick={() => handleSaveProduct(product.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg transition-all ${
                              localEdited 
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md animate-pulse' 
                                : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/25'
                            }`}
                            title="Cambios auto-guardados. Haz clic para archivar cambios de forma segura."
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>{localEdited ? 'Guardar' : 'Guardado'}</span>
                          </button>

                          {/* Dedicated Delete/Remove button that ALWAYS allows deleting the item */}
                          <button
                            onClick={() => {
                              if (deletingProductId === product.id) {
                                // Double tap confirmation: Delete completely!
                                const updated = products.filter(p => Number(p.id) !== Number(product.id));
                                if (onUpdateProducts) {
                                  onUpdateProducts(updated);
                                }
                                setDeletingProductId(null);
                                setSavedToast('El producto ha sido eliminado del stock.');
                                setTimeout(() => setSavedToast(null), 3000);
                              } else {
                                setDeletingProductId(product.id);
                                setSavedToast('Toca otra vez para eliminar de por vida.');
                                setTimeout(() => {
                                  setDeletingProductId(prev => prev === product.id ? null : prev);
                                }, 5000);
                              }
                            }}
                            title="Eliminar este producto permanentemente de la base de datos"
                            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg transition-all ${
                              deletingProductId === product.id
                                ? 'bg-red-600 text-white animate-bounce shadow-lg font-black'
                                : 'bg-red-500/10 hover:bg-red-500 text-red-500 border border-red-500/20 hover:text-white'
                            }`}
                          >
                            <X className="w-4 h-4 stroke-[3]" />
                            <span>{deletingProductId === product.id ? '¿Confirmar?' : 'Eliminar'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls Footer */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8 pb-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border-2 hover:bg-[#FDB913] hover:text-black hover:border-[#FDB913] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-inherit transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border-2 hover:bg-[#FDB913] hover:text-black hover:border-[#FDB913] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-inherit transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'design' && (
              <div className="space-y-8 max-w-5xl mx-auto">
                <div className="border-b pb-4 mb-2">
                  <h3 className={`text-2xl font-black uppercase text-[#FDB913]`}>
                    Diseño y Personalización de Portada
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">Configura el logo oficial de CHIO y agrega imágenes o videos promocionales en forma de historias continuas tipo Instagram.</p>
                </div>

                {/* LOGO SECTOR */}
                <div className={`p-6 rounded-2xl border-2 ${darkMode ? 'bg-gray-800 border-gray-750' : 'bg-white border-gray-200'} shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center`}>
                  <div className="space-y-2 text-left">
                    <h4 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                      <span>🌻 Logo oficial</span>
                    </h4>
                    <p className="text-xs text-gray-400">Sube un logo personalizado de tu negocio para que se reemplace automáticamente en la barra superior y en todos los diálogos.</p>
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={handleResetLogo}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          confirmingLogoReset 
                            ? 'bg-red-600 text-white animate-pulse border-white font-black' 
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20'
                        }`}
                      >
                        {confirmingLogoReset ? '¿CONFIRMAR RESTABLECER?' : 'Restablecer original'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center items-center">
                    <div className="relative p-2 bg-black/10 rounded-full border-2 border-dashed border-[#FDB913]">
                      <img 
                        src={customLogo || '/images/products1/CHIO.png'} 
                        alt="Logo actual" 
                        className="w-24 h-24 object-contain rounded-full bg-white shadow-xl"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md">
                        ACTIVO
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#FDB913] transition-colors relative bg-black/5 min-h-[120px] overflow-hidden">
                    <Upload className="w-8 h-8 text-[#FDB913] mb-1 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider block text-center">Subir nuevo logo</span>
                    <span className="text-[10px] text-gray-400 mt-1 block text-center">Soporta PNG, PNG de fondo transparente, JPG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>

                {/* COVER STORIES / SLIDES SECTOR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form to ADD slide */}
                  <div className={`lg:col-span-5 p-6 rounded-2xl border-2 ${darkMode ? 'bg-gray-800 border-gray-750' : 'bg-white border-gray-200'} shadow-lg space-y-4 text-left`}>
                    <h4 className="text-lg font-bold uppercase tracking-wider text-[#FDB913]">
                      + Crear Nueva Historia / Banner
                    </h4>

                    <form onSubmit={handleAddStory} className="space-y-4">
                      {/* Media type toggle */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase">Tipo de Portada</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => { setNewStoryType('image'); setNewStoryUrl(''); }}
                            className={`py-2 text-xs font-bold rounded-lg transition-all ${newStoryType === 'image' ? 'bg-[#FDB913] text-black shadow-md' : 'bg-black/10 text-gray-400 hover:bg-black/25'}`}
                          >
                            Imagen (Banner Fijo)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setNewStoryType('video'); setNewStoryUrl(''); }}
                            className={`py-2 text-xs font-bold rounded-lg transition-all ${newStoryType === 'video' ? 'bg-[#FDB913] text-black shadow-md' : 'bg-black/10 text-gray-400 hover:bg-black/25'}`}
                          >
                            Video (Reels / MP4)
                          </button>
                        </div>
                      </div>

                      {/* Video/Image upload area */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase">Archivo de Media</label>
                        <div className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-gray-300 rounded-xl relative bg-black/5 min-h-[140px] overflow-hidden">
                          {newStoryUrl ? (
                            <div className="text-center w-full">
                              {newStoryType === 'video' ? (
                                <video src={newStoryUrl} muted className="w-24 h-24 object-cover mx-auto rounded-lg border-2 border-[#FDB913]" />
                              ) : (
                                <img src={newStoryUrl} alt="Preview" className="w-24 h-24 object-cover mx-auto rounded-lg border-2 border-[#FDB913]" />
                              )}
                              <button
                                type="button"
                                onClick={() => setNewStoryUrl('')}
                                className="text-xs text-red-500 hover:underline mt-2 font-bold block mx-auto"
                              >
                                Quitar archivo
                              </button>
                            </div>
                          ) : (
                            <div className="text-center space-y-2">
                              <Upload className="w-8 h-8 text-[#FDB913] mx-auto animate-pulse" />
                              <span className="text-xs font-bold block">Subir Archivo ({newStoryType === 'video' ? 'Video MP4' : 'Imagen'})</span>
                              <span className="text-[10px] text-gray-400 block max-w-[200px] mx-auto text-center">Haz clic para explorar e importar</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept={newStoryType === 'video' ? 'video/*' : 'image/*'}
                            onChange={handleStoryMediaUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                          />
                        </div>
                      </div>

                      {/* Header overlay */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase block">Título Principal (Opcional)</label>
                        <input
                          type="text"
                          value={newStoryTitle}
                          onChange={(e) => setNewStoryTitle(e.target.value)}
                          placeholder="Ej: NUEVA PORTADA HERRAMIENTAS 🌻"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-950 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
                        />
                      </div>

                      {/* Description overlay */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase block">Texto / Descripción Secundaria (Opcional)</label>
                        <input
                          type="text"
                          value={newStorySubtitle}
                          onChange={(e) => setNewStorySubtitle(e.target.value)}
                          placeholder="Ej: Las mejores tendencias para reordenar tu espacio ideal"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-950 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>AGREGAR A LA PORTADA</span>
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List of current banner slides */}
                  <div className={`lg:col-span-7 p-6 rounded-2xl border-2 ${darkMode ? 'bg-gray-800 border-gray-750' : 'bg-white border-gray-200'} shadow-lg space-y-4 text-left`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold uppercase tracking-wider text-[#FDB913]">
                        Anuncios / Historias Activas ({stories.length})
                      </h4>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">
                        El primer banner iniciará el ciclo
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {stories.map((story, index) => {
                        const localEdited = hasLocalStoryEdits(story.id);
                        const displayTitle = getStoryField(story, 'title') || '';
                        const displaySubtitle = getStoryField(story, 'subtitle') || '';
                        const displayType = getStoryField(story, 'type');
                        const displayUrl = getStoryField(story, 'url');
                        const isPendingDelete = deletingStoryId === story.id;

                        return (
                          <div 
                            key={story.id} 
                            className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                              localEdited 
                                ? 'bg-amber-500/5 border-amber-400' 
                                : isPendingDelete 
                                  ? 'bg-red-500/10 border-red-500 animate-pulse'
                                  : darkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-gray-250 hover:bg-amber-505/5'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Slide media preview */}
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-gray-300 shrink-0">
                                  {displayType === 'video' ? (
                                    <video src={displayUrl} className="w-full h-full object-cover" muted />
                                  ) : (
                                    <img src={displayUrl} className="w-full h-full object-cover" alt="Thumb" />
                                  )}
                                  <span className="absolute bottom-1 right-1 bg-black/75 px-1.5 rounded text-[8px] text-white font-bold font-mono">
                                    {displayType === 'video' ? 'VIDEO' : 'IMAGE'}
                                  </span>

                                  {/* Upload hover trigger under inline edit */}
                                  {localEdited && (
                                    <label className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                      <Upload className="w-4 h-4 text-white" />
                                      <span className="text-[8px] font-mono font-bold mt-0.5">SUBIR</span>
                                      <input 
                                        type="file" 
                                        accept={displayType === 'video' ? 'video/*' : 'image/*'} 
                                        className="hidden" 
                                        onChange={(e) => handleStoryMediaChange(story.id, e)} 
                                      />
                                    </label>
                                  )}
                                </div>

                                {/* Info or inputs */}
                                <div className="text-left space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-amber-500 tracking-wider">ORDEN #{index + 1}</span>
                                    {story.id.startsWith('default-') && (
                                      <span className="text-[8px] bg-gray-500/10 px-1.5 py-0.5 rounded text-gray-400 font-bold uppercase tracking-widest">Original</span>
                                    )}
                                  </div>

                                  {localEdited ? (
                                    <div className="space-y-2 mt-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-gray-400">Tipo:</span>
                                        <button
                                          type="button"
                                          onClick={() => handleStoryFieldChange(story.id, 'type', 'image')}
                                          className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${displayType === 'image' ? 'bg-[#FDB913] text-black shadow' : 'bg-black/20 text-gray-400 hover:bg-black/35'}`}
                                        >
                                          Imagen
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleStoryFieldChange(story.id, 'type', 'video')}
                                          className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${displayType === 'video' ? 'bg-[#FDB913] text-black shadow' : 'bg-black/20 text-gray-400 hover:bg-black/35'}`}
                                        >
                                          Video
                                        </button>
                                      </div>

                                      <input
                                        type="text"
                                        value={displayTitle}
                                        onChange={(e) => handleStoryFieldChange(story.id, 'title', e.target.value)}
                                        placeholder="Título del anuncio"
                                        className={`w-full px-2 py-1 rounded text-xs border ${
                                          darkMode ? 'bg-gray-950 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                                        }`}
                                      />
                                      <input
                                        type="text"
                                        value={displaySubtitle}
                                        onChange={(e) => handleStoryFieldChange(story.id, 'subtitle', e.target.value)}
                                        placeholder="Descripción o subtítulo"
                                        className={`w-full px-2 py-1 rounded text-xs border ${
                                          darkMode ? 'bg-gray-950 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                                        }`}
                                      />
                                    </div>
                                  ) : (
                                    <div className="pr-1">
                                      <h5 className="text-sm font-extrabold truncate">{displayTitle || 'Anuncio sin título'}</h5>
                                      <p className="text-xs text-gray-400 truncate line-clamp-1">{displaySubtitle || 'Sin descripción'}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action controls */}
                              <div className="flex items-center gap-1 sm:self-center self-end mt-2 sm:mt-0">
                                {localEdited ? (
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveStory(story.id)}
                                      className="p-1 px-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all"
                                      title="Guardar cambios"
                                    >
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>Guardar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDiscardStoryEdits(story.id)}
                                      className="p-1 px-2 bg-gray-500/20 text-gray-400 hover:bg-gray-500/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                                      title="Descartar cambios"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Descartar</span>
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleStoryFieldChange(story.id, 'title', displayTitle)} // Initializes edit mode
                                      className="p-1.5 rounded-lg border border-gray-300 hover:bg-[#FDB913]/10 hover:border-[#FDB913] hover:text-[#FDB913] transition-all text-xs font-bold flex items-center gap-1"
                                      title="Editar título, subtítulo o logo de esta historia"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                      <span className="hidden md:inline">Editar</span>
                                    </button>

                                    {/* Move Up */}
                                    <button
                                      type="button"
                                      onClick={() => handleMoveStory(index, 'up')}
                                      disabled={index === 0}
                                      className="p-1.5 rounded-lg border hover:bg-[#FDB913] hover:text-black hover:border-[#FDB913] disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                                      title="Subir de prioridad"
                                    >
                                      <ChevronLeft className="w-4 h-4 rotate-90" />
                                    </button>

                                    {/* Move Down */}
                                    <button
                                      type="button"
                                      onClick={() => handleMoveStory(index, 'down')}
                                      disabled={index === stories.length - 1}
                                      className="p-1.5 rounded-lg border hover:bg-[#FDB913] hover:text-black hover:border-[#FDB913] disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                                      title="Bajar de prioridad"
                                    >
                                      <ChevronLeft className="w-4 h-4 -rotate-90" />
                                    </button>

                                    {/* Delete stories */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStory(story.id)}
                                      className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 font-bold text-xs ${
                                        isPendingDelete 
                                          ? 'bg-red-600 text-white animate-pulse border-white font-extrabold px-2 shadow-md' 
                                          : 'border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                                      }`}
                                      title="Eliminar del carrusel"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>{isPendingDelete ? '¿Borrar?' : ''}</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'chioli_feedback' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Intro Banner */}
                <div className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  darkMode ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-[#FDB913]/30' : 'bg-gradient-to-r from-[#FDB913]/5 to-transparent border-amber-200'
                }`}>
                  <div className="space-y-2 max-w-4xl">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#FDB913] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-black" /> Centro de Aprendizaje
                      </span>
                      <h4 className={`text-lg font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-black'}`}>
                        Chío 🤖 — Entrenamiento e Instrucciones de IA
                      </h4>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                      Habla directamente con <span className="font-bold text-[#FDB913]">Chío</span> para enseñarle reglas de comportamiento, tono de voz, detalles de productos o respuestas clave. 
                      Todo lo que le indiques por chat o <span className="font-bold text-[#FDB913]">audio 🎙️</span> se guardará de forma permanente en su memoria para la atención en tienda.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#FDB913]/10 border-2 border-dashed border-[#FDB913]">
                    <span className="text-3xl animate-bounce">🤖</span>
                  </div>
                </div>

                {/* Main 2-Column Grid: Left Chat, Right Memory Base */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Interactive Learning Chat (col-span-7) */}
                  <div className={`lg:col-span-7 p-5 rounded-xl border flex flex-col h-[620px] ${
                    darkMode ? 'bg-gray-800/80 border-gray-750' : 'bg-white border-gray-200'
                  }`}>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between border-b pb-3 border-gray-500/10 shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#FDB913] flex items-center justify-center text-black font-black text-sm shadow">
                          🤖
                        </div>
                        <div>
                          <h4 className={`text-sm font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-black'}`}>
                            Chat Directo con Chío
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Memoria Activa & Aprendizaje Continuo</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSendChioMessage("Chío, dime toda tu información y qué es lo que haces")}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-[#FDB913]/10 text-[#FDB913] border border-[#FDB913]/30 hover:bg-[#FDB913]/20 transition-all flex items-center gap-1"
                          title="Pedir a Chío que liste todo su conocimiento almacenado"
                        >
                          <Brain className="w-3 h-3" /> Ver mi info
                        </button>

                        <button
                          type="button"
                          onClick={handleClearChioChat}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Reiniciar conversación"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2 text-xs">
                      {chioMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 space-y-1 shadow-sm ${
                            msg.sender === 'user'
                              ? 'bg-[#FDB913] text-black font-medium rounded-tr-none'
                              : darkMode 
                                ? 'bg-gray-900 text-gray-100 border border-gray-750 rounded-tl-none' 
                                : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-tl-none'
                          }`}>
                            <div className="flex items-center justify-between gap-3 text-[9px] opacity-75 font-bold uppercase mb-0.5">
                              <span>{msg.sender === 'user' ? 'Tú (Administradora)' : 'Chío 🤖'}</span>
                              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed text-xs">
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      ))}

                      {chioIsTyping && (
                        <div className="flex justify-start">
                          <div className={`rounded-2xl px-4 py-3 flex items-center gap-2 ${
                            darkMode ? 'bg-gray-900 border border-gray-750 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <span className="text-sm animate-spin">🤖</span>
                            <span className="text-xs font-bold italic animate-pulse">Chío está procesando y guardando tu información...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="py-2 border-t border-gray-500/10 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
                      <span className="text-[10px] font-black uppercase text-gray-400 shrink-0">Sugerencias:</span>
                      <button
                        type="button"
                        onClick={() => setChioInput("Chío, los envíos a provincia cuestan 15 soles y demoran 48 horas")}
                        className="px-2.5 py-1 rounded-full bg-amber-500/20 text-[#FDB913] border border-amber-500/30 hover:bg-[#FDB913] hover:text-black transition-colors shrink-0 font-bold flex items-center gap-1"
                      >
                        "Envíos a provincia"
                      </button>
                      <button
                        type="button"
                        onClick={() => setChioInput("Hola Chío, aprende que aceptamos Yape, Plin y transferencia")}
                        className="px-2.5 py-1 rounded-full bg-amber-500/20 text-[#FDB913] border border-amber-500/30 hover:bg-[#FDB913] hover:text-black transition-colors shrink-0 font-bold flex items-center gap-1"
                      >
                        "Medios de pago"
                      </button>
                      <button
                        type="button"
                        onClick={() => setChioInput("Chío, quiero que hables de forma dulce y amigable con emoticones")}
                        className="px-2.5 py-1 rounded-full bg-black/10 hover:bg-[#FDB913]/20 hover:text-[#FDB913] transition-colors shrink-0 text-gray-300"
                      >
                        "Habla amigable"
                      </button>
                    </div>

                    {/* Chat Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChioMessage(chioInput);
                      }}
                      className="flex items-center gap-2 pt-2 border-t border-gray-500/10 shrink-0"
                    >
                      {/* Text Input */}
                      <input
                        type="text"
                        value={chioInput}
                        onChange={(e) => setChioInput(e.target.value)}
                        placeholder="Escribe una instrucción, corrección o dato para Chío..."
                        className={`flex-1 px-4 py-3 rounded-xl border text-xs focus:outline-none transition-colors ${
                          darkMode
                            ? 'bg-gray-900 border-gray-750 text-white focus:border-[#FDB913]'
                            : 'bg-white border-gray-300 text-black focus:border-[#FDB913]'
                        }`}
                      />

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={!chioInput.trim() || chioIsTyping}
                        className={`p-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center ${
                          !chioInput.trim() || chioIsTyping
                            ? 'bg-gray-600/30 text-gray-500 cursor-not-allowed'
                            : 'bg-[#FDB913] hover:bg-[#e5a60b] text-black shadow-md hover:scale-105'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  {/* Learned Memory Base (col-span-5) */}
                  <div className={`lg:col-span-5 p-5 rounded-xl border flex flex-col h-[620px] ${
                    darkMode ? 'bg-gray-800/80 border-gray-750' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-3 border-gray-500/10 shrink-0">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-[#FDB913]" />
                        <h4 className={`text-sm font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-black'}`}>
                          Memoria Guardada de Chío ({chioLearnedInstructions.length})
                        </h4>
                      </div>
                      <span className="text-[10px] text-[#FDB913] font-bold bg-[#FDB913]/10 border border-[#FDB913]/30 px-2 py-0.5 rounded-full">
                        Base Permanente
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 my-3 leading-relaxed shrink-0">
                      Estas son las reglas y datos que Chío ha extraído y almacenado de tus conversaciones. Puedes editarlas o borrarlas en cualquier momento:
                    </p>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {chioLearnedInstructions.length === 0 ? (
                        <div className="text-center py-16 space-y-3">
                          <div className="text-4xl opacity-50">🧠</div>
                          <h5 className={`font-bold text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Memoria limpia
                          </h5>
                          <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                            Escríbele o díctale a Chío en el chat para que aprenda sus primeras instrucciones personalizadas.
                          </p>
                        </div>
                      ) : (
                        chioLearnedInstructions.map((rule, idx) => (
                          <div
                            key={rule.id}
                            className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all relative ${
                              darkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            {editingRuleId === rule.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingRuleText}
                                  onChange={(e) => setEditingRuleText(e.target.value)}
                                  className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none ${
                                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                                  }`}
                                  rows={3}
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingRuleId(null)}
                                    className="px-2.5 py-1 text-[10px] font-bold uppercase rounded text-gray-400 hover:bg-black/10"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditedRule(rule.id)}
                                    className="px-3 py-1 text-[10px] font-bold uppercase rounded bg-[#FDB913] text-black hover:bg-[#e5a60b]"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FDB913]">
                                    <span>#{idx + 1}</span>
                                    <span>• Regla Aprendida</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRuleId(rule.id);
                                        setEditingRuleText(rule.text);
                                      }}
                                      className="p-1 text-gray-400 hover:text-white transition-colors"
                                      title="Editar esta regla"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLearnedRule(rule.id)}
                                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                      title="Eliminar regla de la memoria"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className={`font-semibold leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                  {rule.text}
                                </p>
                                <div className="text-[9px] text-gray-500 font-mono">
                                  Registrado: {new Date(rule.timestamp).toLocaleDateString()}
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Persistent Micro Cropper Modal overlay */}
          {cropperState && cropperState.isOpen && (
            <ImageCropperModal
              isOpen={cropperState.isOpen}
              imageSrc={cropperState.imageSrc}
              initialAspectRatio={cropperState.initialAspectRatio}
              darkMode={darkMode}
              onSave={(cropped) => {
                cropperState.onCropComplete(cropped);
              }}
              onClose={() => setCropperState(null)}
            />
          )}

          {/* Modal para Editar Transacción / Pedido de Periodos Cerrados u Activos */}
          {editingOrder && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <form 
                onSubmit={handleSaveOrderEdit}
                className={`w-full max-w-lg ${darkMode ? 'bg-gray-900 border border-gray-800 text-white' : 'bg-white text-black'} rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 space-y-4`}
              >
                <button 
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className={`absolute top-4 right-4 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'} transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 border-b border-gray-300/20 pb-3">
                  <Edit className="w-5 h-5 text-[#FDB913]" />
                  <h4 className="text-lg font-black uppercase tracking-tight">Editar Pedido {editingOrder.orderNumber}</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-400">Cliente</label>
                    <input 
                      type="text"
                      value={editingOrder.customerName}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, customerName: e.target.value }))}
                      required
                      className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#FDB913] ${
                        darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-55 border-gray-250 text-black'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-400">Celular / WhatsApp</label>
                    <input 
                      type="text"
                      value={editingOrder.customerPhone}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, customerPhone: e.target.value }))}
                      required
                      className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#FDB913] ${
                        darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-55 border-gray-250 text-black'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400">Producto Adquirido</label>
                  <input 
                    type="text"
                    value={editingOrder.productName}
                    onChange={(e) => setEditingOrder(prev => ({ ...prev, productName: e.target.value }))}
                    required
                    className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#FDB913] ${
                      darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-55 border-gray-250 text-black'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-400">Precio de Venta (S/)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={editingOrder.price}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      required
                      className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#FDB913] ${
                        darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-55 border-gray-250 text-black'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-400">Estado de Periodo</label>
                    <select
                      value={editingOrder.archived ? 'archived' : 'active'}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, archived: e.target.value === 'archived' }))}
                      className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#FDB913] ${
                        darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-55 border-gray-250 text-black'
                      }`}
                    >
                      <option value="active">Activo (Periodo Actual)</option>
                      <option value="archived">Archivado / Periodo Cerrado</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-750'}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FDB913] hover:bg-[#e5a60b] text-black rounded-lg text-xs font-black transition-colors shadow-md"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal de Confirmación para Acciones de Cierre/Reinicio */}
          {activeConfirmModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className={`w-full max-w-md ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150`}>
                <button 
                  onClick={() => setActiveConfirmModal(null)}
                  className={`absolute top-4 right-4 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'} transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
 
                {activeConfirmModal === 'archive' ? (
                  <div className="space-y-4 text-left">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Guardar y Archivar Período</h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        Selecciona qué pedidos de este período deseas archivar (cerrar) y cuáles deben permanecer activos (por entregar o cobrar).
                      </p>
                    </div>

                    {/* Checkbox Selector List */}
                    <div className={`max-h-56 overflow-y-auto border rounded-xl divide-y p-2 space-y-1 ${
                      darkMode ? 'bg-gray-950/40 border-gray-800 divide-gray-800' : 'bg-gray-55 border-gray-200 divide-gray-100'
                    }`}>
                      {orders.filter(o => !o.archived).map(order => {
                        const key = getOrderKey(order);
                        const isChecked = archiveSelectionKeys.includes(key);
                        return (
                          <label 
                            key={key} 
                            className="flex items-center justify-between p-2.5 hover:bg-black/5 rounded-lg cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setArchiveSelectionKeys(prev => [...prev, key]);
                                  } else {
                                    setArchiveSelectionKeys(prev => prev.filter(k => k !== key));
                                  }
                                }}
                                className="accent-[#FDB913] w-4 h-4 cursor-pointer"
                              />
                              <div>
                                <p className="font-bold">{order.customerName}</p>
                                <p className="text-gray-400 text-[10px]">{order.productName}</p>
                              </div>
                            </div>
                            <span className="font-bold text-[#FDB913]">S/ {order.price.toFixed(2)}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 justify-between text-[11px] font-bold text-gray-500 px-1">
                      <button 
                        type="button" 
                        onClick={() => setArchiveSelectionKeys(orders.filter(o => !o.archived).map(getOrderKey))}
                        className="text-[#FDB913] hover:underline"
                      >
                        Seleccionar todos
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setArchiveSelectionKeys([])}
                        className="text-[#FDB913] hover:underline"
                      >
                        Deseleccionar todos
                      </button>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveConfirmModal(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const updatedOrders = orders.map(o => {
                            const key = getOrderKey(o);
                            if (archiveSelectionKeys.includes(key)) {
                              return { ...o, archived: true };
                            }
                            return o;
                          });
                          setOrders(updatedOrders);
                          await setDBItem('chio_order_history', updatedOrders);
                          setActiveConfirmModal(null);
                          setSavedToast(`¡Se archivaron ${archiveSelectionKeys.length} pedidos! Los restantes siguen activos.`);
                          setTimeout(() => setSavedToast(null), 4000);
                        }}
                        className="px-4 py-2 bg-[#FDB913] hover:bg-[#e5a60b] text-black rounded-lg text-sm font-bold transition-colors shadow-md"
                      >
                        Confirmar Cierre ({archiveSelectionKeys.length})
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Reiniciar Todo el Historial</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                        ¿Realmente deseas borrar <span className="font-extrabold text-red-655">TODOS</span> los pedidos y clientes archivados?
                      </p>
                      <div className={`mt-3 p-3 rounded-lg text-xs font-semibold ${darkMode ? 'bg-red-955/20 text-red-400 border border-red-500/10' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                        ⚠️ ¡Atención! Esta acción borrará todas las estadísticas, ventas anteriores y clientes de forma definitiva. ¡No se puede recuperar esta información!
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        onClick={() => setActiveConfirmModal(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          setOrders([]);
                          await setDBItem('chio_order_history', []);
                          setActiveConfirmModal(null);
                          setSavedToast("¡Todo el historial de ventas ha sido reiniciado con éxito!");
                          setTimeout(() => setSavedToast(null), 4500);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors shadow-md"
                      >
                        Sí, Borrar Todo el Historial
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
