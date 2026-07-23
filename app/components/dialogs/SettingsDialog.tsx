import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Settings, Check, Lock, LayoutDashboard } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenDashboard: () => void;
}

export function SettingsDialog({ open, onOpenChange, onOpenDashboard }: SettingsDialogProps) {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [saved, setSaved] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = 'chio2026';

  useEffect(() => {
    if (open) {
      setIsAuthenticated(false);
      setPassword('');
      setError('');
      const savedNumber = localStorage.getItem('chio_whatsapp_number');
      if (savedNumber) {
        setWhatsappNumber(savedNumber);
      }
    }
  }, [open]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = password.trim().toLowerCase();
    if (cleanPassword === ADMIN_PASSWORD || cleanPassword === 'chioli 2026' || cleanPassword === 'chioli2026') {
      setIsAuthenticated(true);
      setError('');
      
      // Unlocks the Chioli Retroactive Feedback system
      localStorage.setItem('chioli_feedback_unlocked', 'true');
      
      if (cleanPassword === 'chioli 2026' || cleanPassword === 'chioli2026') {
        localStorage.setItem('chioli_direct_tab', 'chioli_feedback');
      } else {
        localStorage.removeItem('chioli_direct_tab');
      }
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('chio_whatsapp_number', whatsappNumber);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full z-50">
          <Dialog.Description className="sr-only">
            Configuración de administrador de la tienda
          </Dialog.Description>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
              <X className="w-6 h-6" />
            </button>
          </Dialog.Close>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#FDB913] rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-black" />
            </div>
            <Dialog.Title className="text-2xl font-bold text-black">
              Configuración Admin
            </Dialog.Title>
          </div>

          {!isAuthenticated ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <p className="text-center text-gray-600 mb-4">
                Esta sección es solo para administradores
              </p>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FDB913] focus:outline-none transition-colors"
                  placeholder="Ingresa la contraseña"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-[#FDB913] hover:bg-[#FFD700] text-black font-bold py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Acceder
              </button>
            </form>
          ) : saved ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">¡Guardado!</h3>
              <p className="text-gray-600">Tu número de WhatsApp ha sido configurado</p>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => {
                  onOpenChange(false);
                  onOpenDashboard();
                }}
                className="w-full bg-gradient-to-r from-[#FDB913] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FDB913] text-black font-bold py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <LayoutDashboard className="w-6 h-6" />
                Abrir Dashboard Administrativo
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o configura</span>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Número de WhatsApp de la Tienda
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Los pedidos se enviarán automáticamente a este número
                  </p>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FDB913] focus:outline-none transition-colors"
                    placeholder="Ej: 51987654321"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    * Incluye el código de país (ej: 51 para Perú)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FDB913] hover:bg-[#FFD700] text-black font-bold py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Guardar Configuración
                </button>
              </form>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
