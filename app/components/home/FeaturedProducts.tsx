import { products } from '../../../data/products';
import { motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { ProductImage } from '../ProductImage';

export function FeaturedProducts() {
  return (
    <section id="productos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Favoritos de la temporada
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Piezas seleccionadas que transformarán tus espacios.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <ProductImage
                  product={product}
                  className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 hover:bg-amber-900 hover:text-white">
                  <ShoppingBag className="w-4 h-4" />
                  Agregar
                </button>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-amber-600 font-medium mb-1">{product.category}</p>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    <a href={`/product/${product.id}`}>
                      <span aria-hidden="true" className="absolute inset-0 z-0" />
                      {product.name}
                    </a>
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-amber-500">★</span>
                    <span className="text-sm">5.0</span>
                    <span className="text-xs text-gray-400">(0 votos)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">S/ {product.price.toFixed(2)}</p>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    🛒
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
