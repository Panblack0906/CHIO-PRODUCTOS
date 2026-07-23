import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Hero() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="relative bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 h-full flex flex-col justify-center min-h-[85vh]">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="sm:text-center lg:text-left"
            >
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">CREA TU</span>
                <span className="block">ESPACIO IDEAL</span>
                <span className="block">
                  <span className="text-gray-900">CON NUESTROS</span>{' '}
                  <span className="text-amber-500">PRODUCTOS</span>
                </span>
              </h1>
              <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-3">
                <a href="#productos" className="inline-flex items-center justify-center px-8 py-3 border border-transparent font-semibold rounded-md text-black bg-amber-400 hover:bg-amber-500 transition-colors">
                  Comprar
                </a>
                <a href="#trends" className="inline-flex items-center justify-center px-8 py-3 border-2 border-black font-semibold rounded-md text-black bg-transparent hover:bg-gray-100 transition-colors">
                  Catálogo
                </a>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-stretch">
        {!imageFailed ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=2850&q=80"
            alt="Persona mostrando productos"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full bg-gradient-to-tr from-amber-200/40 via-amber-100/20 to-white flex items-center justify-center p-8 text-center select-none">
            <div className="text-center">
              <span className="text-5xl block mb-2">🛍️</span>
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">COLECCIÓN CHIO</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
