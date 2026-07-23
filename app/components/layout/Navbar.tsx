import { useState } from 'react';
import { ShoppingCart, Menu, Search, User, BarChart3 } from 'lucide-react';
import { AdminDashboard } from '../admin/AdminDashboard';

export function Navbar() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <>
      <AdminDashboard open={showAdmin} onOpenChange={setShowAdmin} />
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Menu className="h-6 w-6 sm:hidden text-gray-700 mr-4 cursor-pointer" />
            <a href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-amber-900">
              CHIO<span className="text-gray-900 font-light hidden sm:inline"> | tu espacio ideal</span>
            </a>
          </div>

          <div className="hidden sm:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-amber-800 transition-colors">Inicio</a>
            <a href="#productos" className="text-gray-600 hover:text-amber-800 transition-colors">Catálogo</a>
            <a href="#about" className="text-gray-600 hover:text-amber-800 transition-colors">Nosotros</a>
          </div>

          <div className="flex items-center space-x-5">
            <button className="text-gray-600 hover:text-amber-800 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="text-gray-600 hover:text-amber-800 transition-colors">
              <User className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowAdmin(true)}
              className="text-gray-600 hover:text-amber-800 transition-colors"
              title="Panel de Admin"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <button className="text-gray-600 hover:text-amber-800 transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                2
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
