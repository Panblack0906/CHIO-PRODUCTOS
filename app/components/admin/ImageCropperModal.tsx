import { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  initialAspectRatio: '1:1' | '16:9' | '9:16' | 'free';
  onSave: (croppedBase64: string) => void;
  onClose: () => void;
  darkMode: boolean;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  initialAspectRatio,
  onSave,
  onClose,
  darkMode
}: ImageCropperModalProps) {
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | 'free'>(initialAspectRatio);
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Reset sliders when image or dialog changes
  useEffect(() => {
    if (isOpen) {
      setAspectRatio(initialAspectRatio);
      setZoom(1.0);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
    }
  }, [isOpen, initialAspectRatio, imageSrc]);

  if (!isOpen) return null;

  const handleReset = () => {
    setZoom(1.0);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleApply = () => {
    setIsProcessing(true);
    // Create an offscreen image to load and draw on canvas
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // High-definition 4K/HD output dimensions
      let targetWidth = 1920;
      let targetHeight = 1080;

      if (aspectRatio === '1:1') {
        targetWidth = 1600;
        targetHeight = 1600;
      } else if (aspectRatio === '16:9') {
        targetWidth = 1920;
        targetHeight = 1080;
      } else if (aspectRatio === '9:16') {
        targetWidth = 1080;
        targetHeight = 1920;
      } else {
        // Free: use image's original aspect ratio bounded to max 2048
        const scale = Math.min(2048 / img.width, 2048 / img.height, 1);
        targetWidth = img.width * scale;
        targetHeight = img.height * scale;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Fill with transparent or solid background depending on theme
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Perform center translation and transformation math
      ctx.save();
      ctx.translate(targetWidth / 2 + offsetX, targetHeight / 2 + offsetY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw the image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
      ctx.restore();

      // Convert to compressed JPG with pristine quality (0.95 / 95% quality is visually indistinguishable from raw, looks 4K HD!)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setIsProcessing(false);
      onSave(compressedDataUrl);
    };
    img.onerror = () => {
      setIsProcessing(false);
      console.error('No se pudo cargar la imagen para procesarla.');
    };
  };

  // Compute container height limits and border shapes for the visual interactive preview crop frame
  const getPreviewStyles = () => {
    if (aspectRatio === '1:1') return 'aspect-square max-w-[260px] sm:max-w-[300px] w-full';
    if (aspectRatio === '16:9') return 'aspect-video w-full max-w-[400px]';
    if (aspectRatio === '9:16') return 'aspect-[9/16] max-h-[320px] sm:max-h-[360px] w-auto';
    return 'w-full max-h-[350px] aspect-auto';
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-2 sm:p-4 z-[9999] animate-fade-in backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-lg rounded-2xl border-2 overflow-hidden flex flex-col max-h-[95vh] shadow-2xl transition-all ${
        darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
      }`}>
        {/* Modal Header */}
        <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#FDB913]" />
            <h4 className="font-extrabold uppercase text-xs tracking-wider">Ajustar / Recortar Foto</h4>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-red-500/15 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col items-center">
          
          {/* Aspect Ratio Selector Buttons */}
          <div className="w-full">
            <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 block mb-1.5 text-center">
              1. Relación de Aspecto (Formato)
            </span>
            <div className="grid grid-cols-4 gap-1 mx-auto">
              {[
                { id: '1:1', label: 'Cuadrado', desc: 'Productos' },
                { id: '9:16', label: 'Historia', desc: 'Anuncios' },
                { id: '16:9', label: 'Banner', desc: 'Ancho' },
                { id: 'free', label: 'Libre', desc: 'Original' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setAspectRatio(r.id as any)}
                  className={`p-1.5 rounded-lg text-[10px] font-black transition-all border flex flex-col items-center gap-0.5 ${
                    aspectRatio === r.id
                      ? 'bg-[#FDB913] text-black border-[#FDB913] shadow-md scale-102'
                      : darkMode
                        ? 'bg-gray-800 text-gray-300 border-gray-750 hover:bg-gray-700'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-105'
                  }`}
                >
                  <span className="block">{r.label}</span>
                  <span className="text-[7px] opacity-75 font-mono">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Crop Frame visual container */}
          <div className="w-full flex justify-center items-center py-2 bg-black/20 rounded-xl relative">
            <div className={`relative ${getPreviewStyles()} border-2 border-dashed border-[#FDB913] rounded-lg overflow-hidden bg-black/40 flex items-center justify-center shadow-inner`}>
              {/* Target Image applied with transformations */}
              <img
                src={imageSrc}
                alt="Para recortar"
                className="pointer-events-none select-none max-w-none max-h-none origin-center"
                style={{
                  transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${zoom})`,
                  transition: isProcessing ? 'none' : 'transform 0.05s ease-out'
                }}
              />
              <span className="absolute bottom-2 left-2 bg-[#FDB913]/90 text-black font-mono font-black text-[8px] px-1.5 py-0.5 rounded shadow">
                MARCO DE CORTE
              </span>
            </div>
          </div>

          {/* Sliders for precise adjustment */}
          <div className="w-full space-y-3 pt-2 border-t border-gray-100/10">
            <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 block mb-1.5 text-center">
              2. Ajuste Fino de la Imagen
            </span>

            {/* Zoom Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-400 uppercase">Zoom (Estirar / Encoger)</span>
                <span className="text-[#FDB913] font-mono">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FDB913]"
              />
            </div>

            {/* Position X Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-400 uppercase">Mover Horizontal (Derecha/Izquierda)</span>
                <span className="text-[#FDB913] font-mono">{offsetX}px</span>
              </div>
              <input
                type="range"
                min="-600"
                max="600"
                step="2"
                value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FDB913]"
              />
            </div>

            {/* Position Y Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-400 uppercase">Mover Vertical (Arriba/Abajo)</span>
                <span className="text-[#FDB913] font-mono">{offsetY}px</span>
              </div>
              <input
                type="range"
                min="-600"
                max="600"
                step="2"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FDB913]"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-400 uppercase">Rotación / Girar</span>
                <span className="text-[#FDB913] font-mono">{rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FDB913]"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${darkMode ? 'border-gray-800 bg-gray-950/60' : 'border-gray-200 bg-gray-50'}`}>
          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Restablecer
          </button>
          
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className="px-5 py-2 bg-[#FDB913] hover:bg-[#e5a60b] text-black font-black uppercase rounded-lg shadow-md text-[10px] flex items-center gap-1.5 disabled:opacity-50"
            >
              {isProcessing ? 'Procesando...' : 'Aplicar Corte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
