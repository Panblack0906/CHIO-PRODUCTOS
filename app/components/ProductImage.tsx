import { useState, useEffect } from 'react';

export function ProductImage({
  product,
  className
}: {
  product: { id: string | number; name: string; category?: string; image?: string };
  className?: string;
}) {
  const idNum = Number(product.id);
  const paddedId = String(idNum).padStart(3, '0');
  
  const [srcQueue, setSrcQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  // Zoom Lightbox States
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const queue: string[] = [];

    // 0. Customized image from state/database (base64 or custom URL)
    if (product.image && !product.image.includes('photo-1542838132-92c53300491e')) {
      queue.push(product.image);
    }

    // 1. Check in public static directory (Vite /public)
    queue.push(`/images/products1/parte1/imagen_${paddedId}.png`);
    queue.push(`/images/products1/imagen_${paddedId}.png`);
    queue.push(`/images/products/${paddedId}.jpg`);

    // 2. Check in src source assets directory (Vite compiled)
    try {
      const srcPng1 = new URL(`../../images/products1/parte1/imagen_${paddedId}.png`, import.meta.url).href;
      queue.push(srcPng1);
    } catch (e) {}

    try {
      const srcPng2 = new URL(`../../images/products1/imagen_${paddedId}.png`, import.meta.url).href;
      queue.push(srcPng2);
    } catch (e) {}

    try {
      const srcJpg = new URL(`../../images/products/${paddedId}.jpg`, import.meta.url).href;
      queue.push(srcJpg);
    } catch (e) {}

    // Deduplicate and filter undefined URLs
    const uniqueQueue = Array.from(new Set(queue)).filter(url => url && !url.includes('undefined'));

    setSrcQueue(uniqueQueue);
    setCurrentIndex(0);
    setFailedAll(false);
  }, [idNum, paddedId, product.image, product.name, product.category]);

  const handleError = () => {
    if (currentIndex < srcQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setFailedAll(true);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (failedAll || srcQueue.length === 0) {
    return (
      <div 
        id={`product-fallback-${product.id}`}
        className={`flex flex-col items-center justify-center bg-gray-100 text-gray-500 font-medium p-6 text-center select-none rounded-xl border border-gray-200/50 h-full w-full ${className || ''}`}
      >
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-3 animate-fade-in shadow-inner">
          <span className="text-2xl">🌻</span>
        </div>
        <span className="text-sm font-bold text-gray-800 max-w-[90%] mb-1 leading-snug line-clamp-2">{product.name}</span>
        {product.category && (
          <span className="text-[10px] uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
            {product.category}
          </span>
        )}
      </div>
    );
  }

  const currentSrc = srcQueue[currentIndex] || '';

  return (
    <>
      <div 
        onClick={() => setIsZoomed(true)}
        className="relative group cursor-pointer w-full h-full overflow-hidden"
        title="Haz clic para ampliar la imagen"
      >
        <img
          id={`product-image-${product.id}`}
          src={currentSrc}
          alt={product.name}
          className={`${className} transition-all duration-300 group-hover:scale-105`}
          onError={handleError}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {/* Hover overlay decorator */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="bg-black/75 backdrop-blur-sm text-white px-3.5 py-2 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <svg className="w-4 h-4 stroke-[2.5] text-[#FDB913]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
            Ver más grande
          </div>
        </div>
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-between p-4"
          onClick={() => {
            setIsZoomed(false);
            resetZoom();
          }}
        >
          {/* Lightbox Header */}
          <div 
            className="w-full flex items-center justify-between max-w-4xl text-white py-2 px-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-wider text-[#FDB913] uppercase">Ampliar Producto</span>
              <span className="text-sm font-bold text-gray-200 max-w-xs sm:max-w-md truncate">{product.name}</span>
            </div>
            
            {/* Top controls */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-white/15 px-2.5 py-1 rounded-full font-mono text-gray-300 font-bold">
                Zoom: {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => {
                  setIsZoomed(false);
                  resetZoom();
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-105"
                title="Cerrar vista"
              >
                <svg className="w-5 h-5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          {/* Interactive Zoom/Draggable Layer */}
          <div 
            className="flex-1 w-full max-w-4xl flex items-center justify-center overflow-hidden relative cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
              className="max-h-[70vh] max-w-full select-none"
            >
              <img
                src={currentSrc}
                alt={product.name}
                className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Controls HUD */}
          <div 
            className="w-full flex flex-col items-center gap-3 max-w-md pb-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-gray-400 text-center text-[10px] bg-white/5 py-1 px-3 rounded-full font-bold">
              drag / arrastra para mover u usa los controles
            </div>

            <div className="bg-gray-900/90 border border-gray-800 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center justify-center gap-4 shadow-2xl">
              {/* Zoom Out */}
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="bg-white/10 hover:bg-white/20 active:translate-y-px text-white p-2.5 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-white/10"
                title="Alejar / Achicar"
              >
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/></svg>
              </button>

              {/* Reset */}
              <button
                onClick={resetZoom}
                className="bg-white hover:bg-gray-100 active:translate-y-px text-black text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                title="Restablecer tamaño original"
              >
                <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4.89M9 11l3-3 3 3"></path></svg>
                Restablecer
              </button>

              {/* Zoom In */}
              <button
                onClick={handleZoomIn}
                disabled={scale >= 4.0}
                className="bg-white/10 hover:bg-white/20 active:translate-y-px text-white p-2.5 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-white/10"
                title="Acercar / Agrandar"
              >
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

