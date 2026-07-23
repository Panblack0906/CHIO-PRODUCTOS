import { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Send, Check, Download, Sun } from 'lucide-react';
import html2canvas from 'html2canvas';
import { LogoImage } from '../LogoImage';
import { getDBItem, setDBItem } from '../../utils/db';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  dimensions?: string;
  material?: string;
  colors?: string[];
  preSelectedColor?: string;
}

interface PurchaseDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseDialog({ product, open, onOpenChange }: PurchaseDialogProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    color: '',
    indicaciones: ''
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [activePreviewImage, setActivePreviewImage] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product && open) {
      setFormData({
        nombre: '',
        celular: '',
        color: product.preSelectedColor || '',
        indicaciones: ''
      });
      setActivePreviewImage(product.image || '');
    }
  }, [product, open]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newOrderNumber = `CHIO-${Date.now().toString().slice(-6)}`;
    setOrderNumber(newOrderNumber);
    setShowReceipt(true);

    setTimeout(async () => {
      if (receiptRef.current) {
        try {
          const canvas = await html2canvas(receiptRef.current, {
            backgroundColor: '#ffffff',
            scale: 3,
            logging: false,
            useCORS: true,
            allowTaint: true,
            ignoreElements: (element) => {
              return element.classList?.contains('no-capture');
            },
            onclone: (clonedDoc) => {
              const clonedElement = clonedDoc.querySelector('[data-receipt]');
              if (clonedElement instanceof HTMLElement) {
                clonedElement.style.background = '#ffffff';
                clonedElement.style.color = '#000000';
              }

              const images = clonedDoc.querySelectorAll('img');
              images.forEach(img => {
                if (img instanceof HTMLImageElement) {
                  img.style.display = 'block';
                }
              });
            }
          });
          const image = canvas.toDataURL('image/jpeg', 0.65);
          setReceiptImage(image);

          // Guardar en historial
          const orderData = {
            orderNumber: newOrderNumber,
            productName: product.name,
            price: product.price,
            customerName: formData.nombre,
            customerPhone: formData.celular,
            color: formData.color,
            notes: formData.indicaciones,
            imageData: image,
            timestamp: Date.now()
          };

          const existingOrders = await getDBItem<any[]>('chio_order_history', []);
          existingOrders.push(orderData);
          await setDBItem('chio_order_history', existingOrders);
        } catch (error) {
          console.error('Error generating receipt image:', error);
        }
      }
    }, 300);
  };

  const handleDownloadImage = () => {
    if (receiptImage) {
      const link = document.createElement('a');
      link.download = `CHIO-Boleta-${orderNumber}.png`;
      link.href = receiptImage;
      link.click();
    }
  };

  const handleSendWhatsApp = async () => {
    if (!receiptImage) return;

    try {
      const blob = await (await fetch(receiptImage)).blob();
      const file = new File([blob], `CHIO-Boleta-${orderNumber}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Boleta ${orderNumber}`,
          text: `🛍️ NUEVA ORDEN - CHIO PRODUCTOS\n\n📋 Orden: ${orderNumber}\n👤 Cliente: ${formData.nombre}\n📱 Celular: ${formData.celular}\n📦 Producto: ${product.name}\n💰 Total: S/ ${product.price.toFixed(2)}`
        });
      } else {
        const currentDate = new Date().toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

        const message = `*🛍️ NUEVA ORDEN - CHIO PRODUCTOS*%0A` +
          `*Tu espacio ideal*%0A%0A` +
          `━━━━━━━━━━━━━━━━━━━━%0A` +
          `📋 *ORDEN:* ${orderNumber}%0A` +
          `📅 *Fecha:* ${currentDate}%0A` +
          `━━━━━━━━━━━━━━━━━━━━%0A%0A` +
          `*👤 DATOS DEL CLIENTE*%0A` +
          `▫️ Nombre: ${formData.nombre}%0A` +
          `▫️ Celular: ${formData.celular}%0A%0A` +
          `*📦 DETALLE DEL PEDIDO*%0A` +
          `▫️ Producto: *${product.name}*%0A` +
          (formData.color ? `▫️ Color: ${formData.color}%0A` : '') +
          `▫️ Precio: *S/ ${product.price.toFixed(2)}*%0A` +
          (formData.indicaciones ? `▫️ Indicaciones: _${formData.indicaciones}_\n` : '') +
          `%0A━━━━━━━━━━━━━━━━━━━━%0A` +
          `💳 *TOTAL A PAGAR: S/ ${product.price.toFixed(2)}*%0A` +
          `━━━━━━━━━━━━━━━━━━━━%0A%0A` +
          `✅ Producto separado%0A` +
          `💰 Formas de pago:%0A` +
          `   • Efectivo en tienda%0A` +
          `   • Yape/Plin%0A%0A` +
          `📸 *Boleta digital descargada automáticamente*%0A%0A` +
          `_Gracias por tu compra! 🎉_`;

        const whatsappNumber = localStorage.getItem('chio_whatsapp_number');
        const whatsappUrl = whatsappNumber
          ? `https://wa.me/${whatsappNumber}?text=${message}`
          : `https://wa.me/?text=${message}`;

        handleDownloadImage();
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      const currentDate = new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      const message = `*🛍️ NUEVA ORDEN - CHIO PRODUCTOS*%0A` +
        `*Tu espacio ideal*%0A%0A` +
        `━━━━━━━━━━━━━━━━━━━━%0A` +
        `📋 *ORDEN:* ${orderNumber}%0A` +
        `📅 *Fecha:* ${currentDate}%0A` +
        `━━━━━━━━━━━━━━━━━━━━%0A%0A` +
        `*👤 DATOS DEL CLIENTE*%0A` +
        `▫️ Nombre: ${formData.nombre}%0A` +
        `▫️ Celular: ${formData.celular}%0A%0A` +
        `*📦 DETALLE DEL PEDIDO*%0A` +
        `▫️ Producto: *${product.name}*%0A` +
        (formData.color ? `▫️ Color: ${formData.color}%0A` : '') +
        `▫️ Precio: *S/ ${product.price.toFixed(2)}*%0A` +
        (formData.indicaciones ? `▫️ Indicaciones: _${formData.indicaciones}_\n` : '') +
        `%0A━━━━━━━━━━━━━━━━━━━━%0A` +
        `💳 *TOTAL A PAGAR: S/ ${product.price.toFixed(2)}*%0A` +
        `━━━━━━━━━━━━━━━━━━━━%0A%0A` +
        `✅ Producto separado%0A` +
        `💰 Formas de pago:%0A` +
        `   • Efectivo en tienda%0A` +
        `   • Yape/Plin%0A%0A` +
        `📸 *Boleta digital descargada automáticamente*%0A%0A` +
        `_Gracias por tu compra! 🎉_`;

      const whatsappNumber = localStorage.getItem('chio_whatsapp_number');
      const whatsappUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${message}`
        : `https://wa.me/?text=${message}`;

      handleDownloadImage();
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleClose = () => {
    setShowReceipt(false);
    setReceiptImage(null);
    setOrderNumber('');
    setFormData({ nombre: '', celular: '', color: '', indicaciones: '' });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto z-50">
          <Dialog.Description className="sr-only">
            Formulario para completar la compra del producto seleccionado
          </Dialog.Description>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
              <X className="w-6 h-6" />
            </button>
          </Dialog.Close>

          {!showReceipt ? (
            <>
              <Dialog.Title className="text-2xl font-bold text-black mb-6">
                Completar Compra
              </Dialog.Title>

              <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-[#FDB913] space-y-3">
                {/* Image previewer */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5 border border-gray-200">
                  <img 
                    src={activePreviewImage || '/images/products1/CHIO.png'} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-all duration-350"
                  />
                </div>

                {/* Gallery thumbnails */}
                {product.images && product.images.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {/* Primary photo thumbnail */}
                    <button
                      type="button"
                      onClick={() => setActivePreviewImage(product.image || '')}
                      className={`relative w-12 h-12 rounded border-2 shrink-0 overflow-hidden bg-black/10 transition-all ${
                        activePreviewImage === product.image 
                          ? 'border-[#FDB913] scale-105' 
                          : 'border-transparent opacity-80'
                      }`}
                    >
                      <img src={product.image || '/images/products1/CHIO.png'} alt="Principal" className="w-full h-full object-cover" />
                    </button>

                    {/* Extra photo thumbnails */}
                    {product.images.map((extraImg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePreviewImage(extraImg)}
                        className={`relative w-12 h-12 rounded border-2 shrink-0 overflow-hidden bg-black/10 transition-all ${
                          activePreviewImage === extraImg 
                            ? 'border-[#FDB913] scale-105' 
                            : 'border-transparent opacity-80'
                        }`}
                      >
                        <img src={extraImg} alt={`Extra ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <h3 className="font-extrabold text-black leading-snug">{product.name}</h3>
                  <p className="text-2xl font-black text-[#FDB913] mt-1">
                    S/ {product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FDB913] focus:outline-none transition-colors"
                    placeholder="Ingresa tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Número de Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FDB913] focus:outline-none transition-colors"
                    placeholder="Ej: 987654321"
                  />
                </div>

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Color *
                    </label>
                    <select
                      required
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FDB913] focus:outline-none transition-colors bg-white"
                    >
                      <option value="">Selecciona un color</option>
                      {product.colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Indicaciones Adicionales
                  </label>
                  <textarea
                    value={formData.indicaciones}
                    onChange={(e) => setFormData({ ...formData, indicaciones: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FDB913] focus:outline-none transition-colors resize-none"
                    rows={3}
                    placeholder="Cualquier indicación especial para tu pedido..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FDB913] hover:bg-[#FFD700] text-black font-bold py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Generar Boleta
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">¡Pedido Realizado!</h3>
                <p className="text-gray-600">Tu solicitud de compra ha sido generada</p>
              </div>

              <div
                ref={receiptRef}
                data-receipt
                style={{
                  background: '#ffffff',
                  border: '4px solid #FDB913',
                  borderRadius: '12px',
                  padding: '24px',
                  color: '#000000'
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
                  <div style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#ffffff',
                    padding: '8px',
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LogoImage
                      style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <h2 style={{ fontWeight: 'bold', color: '#000000', fontSize: '18px', marginBottom: '4px' }}>CHIO PRODUCTOS</h2>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Tu espacio ideal</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#FDB913' }}>BOLETA DIGITAL</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Orden N°: {orderNumber}</p>
                </div>

                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: '#6b7280' }}>Producto:</span>
                    <span style={{ fontWeight: 'bold', color: '#000000' }}>{product.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: '#6b7280' }}>Precio:</span>
                    <span style={{ fontWeight: 'bold', color: '#FDB913' }}>
                      S/ {product.price.toFixed(2)}
                    </span>
                  </div>
                  {formData.color && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Color:</span>
                      <span style={{ fontWeight: '600', color: '#000000' }}>{formData.color}</span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
                  <p style={{ fontWeight: 'bold', color: '#000000', marginBottom: '8px', fontSize: '14px' }}>DATOS DEL CLIENTE</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: '#6b7280' }}>Nombre:</span>
                    <span style={{ fontWeight: '600', color: '#000000' }}>{formData.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: '#6b7280' }}>Celular:</span>
                    <span style={{ fontWeight: '600', color: '#000000' }}>{formData.celular}</span>
                  </div>
                  {formData.indicaciones && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ color: '#6b7280', display: 'block', marginBottom: '4px', fontSize: '14px' }}>Indicaciones:</span>
                      <p style={{ color: '#000000', fontSize: '12px', background: '#f9fafb', padding: '8px', borderRadius: '6px' }}>
                        {formData.indicaciones}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center', marginTop: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                    Producto separado. Pagar en tienda física o por Yape.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownloadImage}
                  disabled={!receiptImage}
                  className="w-full bg-[#FDB913] hover:bg-[#FFD700] text-black font-bold py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  Descargar Boleta
                </button>

                <button
                  onClick={handleSendWhatsApp}
                  disabled={!receiptImage}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {receiptImage ? 'Enviar por WhatsApp' : 'Generando Boleta...'}
                </button>

                <button
                  onClick={handleClose}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
