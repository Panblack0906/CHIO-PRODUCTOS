import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Clock, Send, Download, User } from 'lucide-react';
import { getDBItem } from '../../utils/db';

interface Order {
  orderNumber: string;
  productName: string;
  price: number;
  customerName: string;
  customerPhone: string;
  color?: string;
  notes?: string;
  imageData: string;
  timestamp: number;
}

interface OrderHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderHistoryDialog({ open, onOpenChange }: OrderHistoryDialogProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (open) {
        const parsedOrders = await getDBItem<Order[]>('chio_order_history', []);
        setOrders(parsedOrders.sort((a: Order, b: Order) => b.timestamp - a.timestamp));
      }
    }
    loadOrders();
  }, [open]);

  const handleDownload = (order: Order) => {
    const link = document.createElement('a');
    link.download = `CHIO-Boleta-${order.orderNumber}.png`;
    link.href = order.imageData;
    link.click();
  };

  const handleSendWhatsApp = async (order: Order) => {
    try {
      const blob = await (await fetch(order.imageData)).blob();
      const file = new File([blob], `CHIO-Boleta-${order.orderNumber}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Boleta ${order.orderNumber}`,
          text: `🛍️ ORDEN - CHIO PRODUCTOS\n\n📋 Orden: ${order.orderNumber}\n👤 Cliente: ${order.customerName}\n📱 Celular: ${order.customerPhone}\n📦 Producto: ${order.productName}\n💰 Total: S/ ${order.price.toFixed(2)}`
        });
      } else {
        const orderDate = new Date(order.timestamp).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

        const message = `*🛍️ ORDEN - CHIO PRODUCTOS*%0A` +
          `*Tu espacio ideal*%0A%0A` +
          `━━━━━━━━━━━━━━━━━━━━%0A` +
          `📋 *ORDEN:* ${order.orderNumber}%0A` +
          `📅 *Fecha:* ${orderDate}%0A` +
          `━━━━━━━━━━━━━━━━━━━━%0A%0A` +
          `*👤 DATOS DEL CLIENTE*%0A` +
          `▫️ Nombre: ${order.customerName}%0A` +
          `▫️ Celular: ${order.customerPhone}%0A%0A` +
          `*📦 DETALLE DEL PEDIDO*%0A` +
          `▫️ Producto: *${order.productName}*%0A` +
          (order.color ? `▫️ Color: ${order.color}%0A` : '') +
          `▫️ Precio: *S/ ${order.price.toFixed(2)}*%0A` +
          (order.notes ? `▫️ Indicaciones: _${order.notes}_\n` : '') +
          `%0A━━━━━━━━━━━━━━━━━━━━%0A` +
          `💳 *TOTAL A PAGAR: S/ ${order.price.toFixed(2)}*%0A` +
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

        handleDownload(order);
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      const orderDate = new Date(order.timestamp).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      const message = `*🛍️ ORDEN - CHIO PRODUCTOS*%0A` +
        `*Tu espacio ideal*%0A%0A` +
        `━━━━━━━━━━━━━━━━━━━━%0A` +
        `📋 *ORDEN:* ${order.orderNumber}%0A` +
        `📅 *Fecha:* ${orderDate}%0A` +
        `━━━━━━━━━━━━━━━━━━━━%0A%0A` +
        `*👤 DATOS DEL CLIENTE*%0A` +
        `▫️ Nombre: ${order.customerName}%0A` +
        `▫️ Celular: ${order.customerPhone}%0A%0A` +
        `*📦 DETALLE DEL PEDIDO*%0A` +
        `▫️ Producto: *${order.productName}*%0A` +
        (order.color ? `▫️ Color: ${order.color}%0A` : '') +
        `▫️ Precio: *S/ ${order.price.toFixed(2)}*%0A` +
        (order.notes ? `▫️ Indicaciones: _${order.notes}_\n` : '') +
        `%0A━━━━━━━━━━━━━━━━━━━━%0A` +
        `💳 *TOTAL A PAGAR: S/ ${order.price.toFixed(2)}*%0A` +
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

      handleDownload(order);
      window.open(whatsappUrl, '_blank');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50">
          <Dialog.Description className="sr-only">
            Historial de pedidos realizados
          </Dialog.Description>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
              <X className="w-6 h-6" />
            </button>
          </Dialog.Close>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#FDB913] rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-black" />
            </div>
            <Dialog.Title className="text-2xl font-bold text-black">
              Historial de Pedidos
            </Dialog.Title>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay pedidos guardados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#FDB913] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-black text-lg">
                          #{order.orderNumber}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(order.timestamp)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Producto</p>
                          <p className="font-semibold text-black">{order.productName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Precio</p>
                          <p className="font-bold text-[#FDB913]">S/ {order.price.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        <User className="w-4 h-4" />
                        <span className="font-semibold">{order.customerName}</span>
                        <span className="text-gray-500">•</span>
                        <span>{order.customerPhone}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleDownload(order)}
                        className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                      <button
                        onClick={() => handleSendWhatsApp(order)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <Send className="w-4 h-4" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-[#FDB913] hover:bg-[#FFD700] text-black px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Ver Boleta
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedOrder && (
            <Dialog.Root open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full z-50">
                  <Dialog.Close asChild>
                    <button className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </Dialog.Close>
                  <Dialog.Title className="text-xl font-bold text-black mb-4">
                    Boleta #{selectedOrder.orderNumber}
                  </Dialog.Title>
                  <img
                    src={selectedOrder.imageData}
                    alt={`Boleta ${selectedOrder.orderNumber}`}
                    className="w-full rounded-lg border-2 border-[#FDB913]"
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
