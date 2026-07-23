import { Star, Settings, Search, Clock, Filter, X, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PurchaseDialog } from './components/dialogs/PurchaseDialog';
import { SettingsDialog } from './components/dialogs/SettingsDialog';
import { OrderHistoryDialog } from './components/dialogs/OrderHistoryDialog';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { productsData as importedProductsData, mapProductCategory } from '../data/products-data';
import { ProductImage } from './components/ProductImage';
import { LogoImage } from './components/LogoImage';
import { StoryPlayer, StoryItem } from './components/StoryPlayer';
import { getDBItem, setDBItem } from './utils/db';
import { ChiolyChat } from './components/ChiolyChat';

const productsData = importedProductsData;

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'catalog'>('home');
  const [products, setProducts] = useState<any[]>([]);
  const [whatsAppNumber, setWhatsAppNumber] = useState('51999999999');
  const [whatsAppWelcomeMessage, setWhatsAppWelcomeMessage] = useState('Hola, me interesa comprar en CHIO Productos.');
  const [customLogo, setCustomLogo] = useState('');
  const [stories, setStories] = useState<StoryItem[]>([]); // initialized in useEffect
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Todos"]);

  const categories = [
    "Todos",
    ...Array.from(new Set(products.map((p: any) => p.category).filter(Boolean).map(c => String(c)))).sort()
  ];

  const getCategoryCount = (category: string) => {
    if (category === "Todos") {
      return products.length;
    }
    return products.filter(p => p.category === category).length;
  };

  const handleFilterToggle = (category: string) => {
    if (category === "Todos") {
      if (selectedFilters.includes("Todos") && selectedFilters.length === 1) {
        return;
      }
      setSelectedFilters(["Todos"]);
      setSelectedCategory("Todos");
    } else {
      let newFilters = [...selectedFilters.filter(f => f !== "Todos")];

      if (newFilters.includes(category)) {
        newFilters = newFilters.filter(f => f !== category);
      } else {
        newFilters.push(category);
      }

      if (newFilters.length === 0) {
        newFilters = ["Todos"];
      } else if (newFilters.length === categories.length - 1) {
        newFilters = ["Todos"];
      }

      setSelectedFilters(newFilters);
      setSelectedCategory(newFilters[0]);
    }
  };

  const getVisibleCategories = () => {
    if (selectedFilters.includes("Todos")) {
      return ["Todos"];
    }
    return ["Todos", ...selectedFilters];
  };

  useEffect(() => {
    async function loadData() {
      // 1. Load Custom Logo
      const savedLogo = await getDBItem<string>('chio_custom_logo', '');
      setCustomLogo(savedLogo);

      // 2. Load WhatsApp
      const savedNum = localStorage.getItem('chio_whatsapp_number') || '51999999999';
      setWhatsAppNumber(savedNum);
      const savedMsg = localStorage.getItem('chio_whatsapp_welcome_message') || 'Hola, me interesa comprar en CHIO Productos.';
      setWhatsAppWelcomeMessage(savedMsg);

      // 3. Load Stories
      const defaultStories: StoryItem[] = [
        {
          id: 'default-1',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=1000&q=80',
          title: 'Crea tu espacio ideal',
          subtitle: 'Variedad, calidad y estilo para transformar tu día a día.'
        },
        {
          id: 'default-2',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
          title: 'Organización preciosa 🌻',
          subtitle: 'Dale un respiro a tu hogar con artículos decorativos y prácticos.'
        },
        {
          id: 'default-3',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
          title: 'Llegaron novedades',
          subtitle: 'Accesorios exclusivos, belleza y mucho más para ti.'
        }
      ];
      const savedStories = await getDBItem<StoryItem[]>('chio_stories_v2', defaultStories);
      setStories(savedStories);

      // 4. Load Products
      const savedProducts = await getDBItem<any[]>('chio_products_v2', []);
      const savedRatings = localStorage.getItem('chio_product_ratings_v2') || '{}';
      const ratings = JSON.parse(savedRatings);

      let loadedProducts: any[] = [];
      if (savedProducts && savedProducts.length > 0) {
        loadedProducts = savedProducts.map((p: any) => {
          let finalName = p.name;
          let finalDesc = p.description;
          if (p.id === 75) {
            finalName = "Patrullero";
            finalDesc = "Excelente peine patrullero metálico para eliminar piojos y liendres de forma eficaz, ideal para el cuidado y la higiene personal.";
          }
          return {
            ...p,
            name: finalName,
            description: finalDesc,
            category: mapProductCategory(p.category, p.name)
          };
        });
        await setDBItem('chio_products_v2', loadedProducts);
      } else {
        loadedProducts = productsData.map(product => {
          const r = ratings[product.id];
          const fakeTotal = r?.total || (Math.floor(Math.random() * (80 - 40 + 1)) + 40);
          const ratingVal = r?.rating || 5.0;
          return {
            ...product,
            rating: ratingVal,
            totalRatings: fakeTotal
          };
        });
        await setDBItem('chio_products_v2', loadedProducts);
      }
      setProducts(loadedProducts);
    }

    loadData();
  }, []);

  const handleBuy = (product: typeof products[0]) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleRating = (productId: number, rating: number) => {
    const savedRatings = JSON.parse(localStorage.getItem('chio_product_ratings_v2') || '{}');
    const userRatings = JSON.parse(localStorage.getItem('chio_user_ratings_v2') || '{}');

    if (!userRatings[productId]) {
      const currentProduct = savedRatings[productId] || { rating: 0, total: 0, sum: 0 };
      const newSum = currentProduct.sum + rating;
      const newTotal = currentProduct.total + 1;
      const newRating = newSum / newTotal;

      savedRatings[productId] = {
        rating: newRating,
        total: newTotal,
        sum: newSum
      };

      userRatings[productId] = rating;

      localStorage.setItem('chio_product_ratings_v2', JSON.stringify(savedRatings));
      localStorage.setItem('chio_user_ratings_v2', JSON.stringify(userRatings));

      const updatedProducts = products.map(product =>
        product.id === productId
          ? { ...product, rating: newRating, totalRatings: newTotal }
          : product
      );
      setProducts(updatedProducts);
      setDBItem('chio_products_v2', updatedProducts);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCategory = false;
    if (selectedFilters.includes("Todos")) {
      matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    } else {
      matchesCategory = selectedFilters.includes(product.category);
    }

    return matchesSearch && matchesCategory;
  });

  const trendingProducts = [...products].sort((a, b) => b.totalRatings - a.totalRatings).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-black shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setCurrentView('home')}
            >
              <LogoImage 
                className="h-16 w-16 md:h-24 md:w-24 lg:h-28 lg:w-28 object-contain rounded-full bg-white shadow-md p-1" 
              />
              <div className="flex flex-col ml-3">
                <span className="text-2xl md:text-3xl font-black text-[#FDB913] tracking-tight leading-none">CHIO PRODUCTOS</span>
                <span className="hidden sm:block text-sm md:text-base font-medium text-white mt-1">tu espacio ideal</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setCurrentView('home')}
                className={`text-sm tracking-wide transition-colors ${currentView === 'home' ? 'font-bold text-[#FDB913] border-b-2 border-[#FDB913] pb-1' : 'text-gray-400 hover:text-[#FDB913]'}`}
              >
                Inicio
              </button>
              <button
                onClick={() => setCurrentView('catalog')}
                className={`text-sm tracking-wide transition-colors ${currentView === 'catalog' ? 'font-bold text-[#FDB913] border-b-2 border-[#FDB913] pb-1' : 'text-gray-400 hover:text-[#FDB913]'}`}
              >
                Catálogo
              </button>
            </nav>

            <div className="flex gap-4 items-center">
              <button className="text-gray-400 hover:text-white transition-colors" onClick={() => setCurrentView('catalog')}>
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setHistoryOpen(true)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Historial de Pedidos"
              >
                <Clock className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Configuración"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {currentView === 'home' ? (
        <div className="flex-1">
          <div className="relative bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:w-1/2 lg:pb-28 xl:pb-32 pt-10 sm:pt-16 lg:pt-20 lg:px-4 xl:px-8">
                <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20">
                  <div className="text-center lg:text-left">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl flex flex-col items-center lg:items-start text-balance">
                      <span className="block text-black uppercase">CREA TU ESPACIO IDEAL</span>
                      <span className="block text-[#FDB913] uppercase">CON NUESTROS PRODUCTOS 🌻</span>
                    </h1>
                    <p className="mt-4 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                      Encuentra todo lo que necesitas para tu día a día. Variedad, calidad y estilo en un solo lugar.
                    </p>
                    <div className="mt-5 sm:mt-8 flex justify-center lg:justify-start gap-4">
                      <div className="rounded-md shadow">
                        <button
                          onClick={() => setCurrentView('catalog')}
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-[#FDB913] hover:bg-[#e5a60b] md:py-4 md:text-lg transition-colors"
                        >
                          Ver Catálogo
                        </button>
                      </div>
                      <div className="rounded-md shadow">
                        <button
                          onClick={() => {
                              const tendenciasSection = document.getElementById('tendencias');
                              tendenciasSection?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-900 md:py-4 md:text-lg transition-colors"
                        >
                          Tendencias
                        </button>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-stretch overflow-hidden">
              <StoryPlayer stories={stories} />
            </div>
          </div>

          <div id="tendencias" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">Tendencias de la temporada</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <ProductImage product={product} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <span className="text-xs font-semibold text-[#FDB913] tracking-wider uppercase mb-1">{product.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-4">
                      <Star className="w-4 h-4 fill-[#FDB913] text-[#FDB913]" />
                      <span className="text-sm font-bold text-gray-700">{product.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({product.totalRatings} votos)</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">S/ {product.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleBuy(product)}
                        className="p-2 bg-gray-100 rounded-full hover:bg-[#FDB913] hover:text-black transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-4">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#FDB913] focus:ring-1 focus:ring-[#FDB913] focus:outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 border ${
                    showFilters
                      ? 'bg-gray-100 border-gray-300 text-gray-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                  Filtros
                </button>
              </div>

              {showFilters && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Selecciona categorías:</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleFilterToggle(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedFilters.includes(category) || (category !== "Todos" && selectedFilters.includes("Todos"))
                            ? 'bg-[#FDB913] text-black shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category} <span className="opacity-70 text-xs ml-1">({getCategoryCount(category)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {getVisibleCategories().map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedCategory === category
                        ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-[#FDB913]"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-50">
                    <ProductImage
                      product={product}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-[#FDB913] text-[#FDB913]" />
                      <span className="text-sm font-bold text-gray-900">
                        {product.rating > 0 ? product.rating.toFixed(1) : '0.0'}
                      </span>
                      {product.totalRatings > 0 && (
                        <span className="text-xs font-medium text-gray-500">({product.totalRatings})</span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-xl font-bold text-gray-900 leading-tight">
                        {product.name}
                      </h2>
                    </div>

                    {product.description && (
                      <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    <div className="mb-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </div>

                    <div className="mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Califica este producto</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isRated = !!JSON.parse(localStorage.getItem('chio_user_ratings_v2') || '{}')[product.id];
                          const isActive = star <= (product.rating || 0);
                          return (
                            <button
                              key={star}
                              onClick={() => handleRating(product.id, star)}
                              disabled={isRated}
                              className="disabled:cursor-not-allowed group"
                            >
                              <Star
                                className={`w-6 h-6 transition-all duration-200 ${
                                  isActive
                                    ? 'fill-[#FDB913] text-[#FDB913]'
                                    : 'text-gray-300 group-hover:text-[#FDB913] group-hover:scale-110'
                                } ${isRated && isActive ? 'opacity-90' : isRated ? 'opacity-30' : ''}`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Precio</p>
                        <p className="text-2xl font-bold text-gray-900">
                          S/ {product.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuy(product)}
                        className="bg-gray-900 hover:bg-[#FDB913] text-white hover:text-black px-6 py-3 rounded-xl transition-all duration-300 font-bold shadow-sm"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">No se encontraron productos con estos filtros.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFilters(['Todos']);
                    setSelectedCategory('Todos');
                  }}
                  className="mt-4 text-[#FDB913] font-medium hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </main>
        </div>
      )}

      <footer className="bg-black mt-16 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
          <span className="text-3xl font-bold tracking-tight text-white mb-3 block">
            CHIO PRODUCTOS<span className="text-[#FDB913] font-light"> | tu espacio ideal</span>
          </span>
          <p className="text-gray-400 text-sm max-w-xl mb-8">
            Descubre un mundo de soluciones prácticas para tu día a día. Te ofrecemos lo mejor en accesorios, productos de belleza, organización para el hogar y muchas otras novedades a precios increíbles. ¡Todo lo que necesites en un solo lugar!
          </p>

          <div className="flex flex-col items-center gap-2 mb-8 border border-dashed border-gray-800 p-4 rounded-xl max-w-sm mx-auto">
            <p className="text-sm font-medium text-white mb-2">¡Contáctanos y haz tu pedido!</p>
            <a 
              href={`https://wa.me/${whatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsAppWelcomeMessage)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 bg-[#FDB913] text-black px-6 py-3 rounded-full font-bold hover:bg-[#e5a60b] transition-colors shadow-lg"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Escríbenos por WhatsApp
            </a>
          </div>

          <div className="w-full border-t border-gray-800 pt-8 mt-4 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-[#FDB913] font-semibold">
              © {new Date().getFullYear()} CHIO Productos. Todos los derechos reservados.
            </p>
            <div className="mt-4 md:mt-0 flex items-center text-gray-400">
              Seleccionamos cada producto con mucho <svg className="h-4 w-4 mx-1 text-red-500 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> para ti.
            </div>
          </div>
        </div>
      </footer>

      <PurchaseDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onOpenDashboard={() => setDashboardOpen(true)}
      />

      <OrderHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />

      <AdminDashboard
        open={dashboardOpen}
        onOpenChange={setDashboardOpen}
        products={products}
        onUpdateProducts={(updated) => {
          setProducts(updated);
          setDBItem('chio_products_v2', updated);
        }}
        whatsAppNumber={whatsAppNumber}
        onUpdateWhatsAppNumber={(num) => {
          setWhatsAppNumber(num);
          localStorage.setItem('chio_whatsapp_number', num);
        }}
        whatsAppWelcomeMessage={whatsAppWelcomeMessage}
        onUpdateWhatsAppWelcomeMessage={(msg) => {
          setWhatsAppWelcomeMessage(msg);
          localStorage.setItem('chio_whatsapp_welcome_message', msg);
        }}
        stories={stories}
        onUpdateStories={(newStories) => {
          setStories(newStories);
          setDBItem('chio_stories_v2', newStories);
        }}
              customLogo={customLogo}
        onUpdateCustomLogo={(newLogo) => {
          setCustomLogo(newLogo);
          setDBItem('chio_custom_logo', newLogo);
          window.dispatchEvent(new Event('chio_logo_updated'));
        }}
      />

      <ChiolyChat />
    </div>
  );
}
