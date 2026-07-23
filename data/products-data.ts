export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

const rawProductsData: Product[] = [
  {
    "id": 1,
    "name": "Cepillo para mascota",
    "price": 6,
    "description": "A vapor, es recargable",
    "category": "Mascotas",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 2,
    "name": "Perchero",
    "price": 4,
    "description": "Es de acrílico",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 3,
    "name": "Pabilo",
    "price": 1,
    "description": "Excelente pabilo para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 4,
    "name": "Porta celular",
    "price": 5,
    "description": "Excelente porta celular para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 5,
    "name": "Set de brochas para maquillaje",
    "price": 5,
    "description": "Excelente set de brochas para maquillaje para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 6,
    "name": "Cojín",
    "price": 16,
    "description": "Es de silicona",
    "category": "Decoración y Textil",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 7,
    "name": "Masajeador mariposa",
    "price": 6,
    "description": "Recargable",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 8,
    "name": "Tacho",
    "price": 15,
    "description": "Excelente tacho para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Decoración y Textil",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 9,
    "name": "Protector de ventana y puerta",
    "price": 8,
    "description": "Es de 5 metros",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 10,
    "name": "Set de colgadores",
    "price": 5,
    "description": "Viene 12 unidades",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 11,
    "name": "5 Taper de acero",
    "price": 10,
    "description": "Vienen 5 unidades, acero delgado",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 12,
    "name": "Masajeador pulpo",
    "price": 6,
    "description": "Funciona enchufado o pilas 3",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 13,
    "name": "Organizador de calzados",
    "price": 25,
    "description": "7 niveles",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 14,
    "name": "Kit viajero",
    "price": 4,
    "description": "Para shampoo, alcohol en gel, etc.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 15,
    "name": "Espejo LED",
    "price": 7,
    "description": "Viene con luz LED, es recargable",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 16,
    "name": "Espejo",
    "price": 8,
    "description": "Excelente espejo para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 17,
    "name": "Shampoo de Romero",
    "price": 16,
    "description": "1 litro",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 18,
    "name": "Cepillo dental",
    "price": 2,
    "description": "Excelente cepillo dental para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 19,
    "name": "Set de bolsas viajeros",
    "price": 15,
    "description": "Vienen 6 bolsas",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 20,
    "name": "Organizador de escritorio",
    "price": 20,
    "description": "Material de madera",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 21,
    "name": "Espuma facial",
    "price": 15,
    "description": "Jabón facial",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 22,
    "name": "Rodillo facial",
    "price": 6,
    "description": "Es de hielo",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 23,
    "name": "Taper",
    "price": 11,
    "description": "Material pirex, apto para microondas",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 24,
    "name": "Detergente",
    "price": 17,
    "description": "2 kilos",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 25,
    "name": "Rasuradora facial",
    "price": 2,
    "description": "Excelente rasuradora facial para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 26,
    "name": "Rollo de cinta doble cara",
    "price": 6,
    "description": "Excelente rollo de cinta doble cara para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 27,
    "name": "Perchero adhesivo",
    "price": 3,
    "description": "Es adhesivo, contiene 6 percheritos",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 28,
    "name": "Bandeja escurridora",
    "price": 5,
    "description": "Es de silicona",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 29,
    "name": "Perfume",
    "price": 70,
    "description": "Yanbal",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 30,
    "name": "Cuadro adhesivo",
    "price": 6,
    "description": "Es en 3D",
    "category": "Decoración y Textil",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 31,
    "name": "Jabones naturales",
    "price": 5,
    "description": "De arroz, carbón, cúrcuma, concha nácar, cebo res y sábila",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 32,
    "name": "Gel de cannabis",
    "price": 6,
    "description": "Eficaz para dolor muscular y articulaciones",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 33,
    "name": "Molde de cejas",
    "price": 2,
    "description": "Excelente molde de cejas para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 34,
    "name": "Papel servilleta",
    "price": 1.5,
    "description": "Paquete de 10 unidades a 12 soles",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 35,
    "name": "Parche para várices",
    "price": 6,
    "description": "Excelente parche para várices para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 36,
    "name": "Molde para empanadas",
    "price": 10,
    "description": "Excelente molde para empanadas para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 37,
    "name": "Gotas para los hongos",
    "price": 6,
    "description": "Excelente gotas para los hongos para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 38,
    "name": "Rasca rico de acero",
    "price": 3,
    "description": "Se agranda",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 39,
    "name": "Papel toalla",
    "price": 8,
    "description": "56 MT, peso 1 kilo",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 40,
    "name": "Tinte para cejas",
    "price": 7,
    "description": "Excelente tinte para cejas para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 41,
    "name": "Sombrilla",
    "price": 12,
    "description": "Colores: anaranjado, azul, marrón, verde, lila",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 42,
    "name": "Cubre canas en barra",
    "price": 6,
    "description": "Color negro y marrón, ideal para cubrir las canas",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 43,
    "name": "Foco sensor",
    "price": 5,
    "description": "Es recargable",
    "category": "Tecnología y Electrónica",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 44,
    "name": "Estante adhesivo",
    "price": 4,
    "description": "Se pega a la mayólica, colores verde, plomo",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 45,
    "name": "Shampoo para mascota",
    "price": 7,
    "description": "Contiene 250 ml",
    "category": "Mascotas",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 46,
    "name": "Costurero viajero",
    "price": 5,
    "description": "Excelente costurero viajero para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 47,
    "name": "Porta cepillo con esterilizador",
    "price": 15,
    "description": "Es recargable",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 48,
    "name": "Cable de cargador",
    "price": 5,
    "description": "Es de nylon",
    "category": "Tecnología y Electrónica",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 49,
    "name": "Máquina depiladora",
    "price": 8,
    "description": "Funciona con 1 pila AAA",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 50,
    "name": "Aceitero",
    "price": 6,
    "description": "Excelente aceitero para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 51,
    "name": "Depilador de vellos",
    "price": 3,
    "description": "Es de piedra",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 52,
    "name": "Organizador joyero",
    "price": 20,
    "description": "Excelente organizador joyero para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 53,
    "name": "Encendedor recargable",
    "price": 8,
    "description": "Es recargable, muy efectivo",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 54,
    "name": "Limpiador para poet",
    "price": 4,
    "description": "Excelente limpiador para poet para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 55,
    "name": "Rollo de papel toalla facial",
    "price": 6,
    "description": "Excelente rollo de papel toalla facial para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 56,
    "name": "Tomatodo",
    "price": 10,
    "description": "1 lt, es de acrílico",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 57,
    "name": "Protector para puerta",
    "price": 3,
    "description": "Excelente protector para puerta para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 58,
    "name": "Azucarera",
    "price": 5,
    "description": "Material acrílico",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 59,
    "name": "Guantes de latex",
    "price": 4,
    "description": "Talla S, M, L",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 60,
    "name": "Cuaderno de notas",
    "price": 6,
    "description": "89 hojas, pasta gruesa",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 61,
    "name": "Porta huevos",
    "price": 15,
    "description": "3 niveles, para 17 huevos, material acrílico",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 62,
    "name": "Cinta fosforescente",
    "price": 6,
    "description": "Ideal para bordes de escaleras",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 63,
    "name": "Organizador refrigeradora",
    "price": 4,
    "description": "Ideal para la refrigeradora",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 64,
    "name": "Set de fuentes",
    "price": 20,
    "description": "Vienen 4 unidades",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 65,
    "name": "Organizador de cepillos",
    "price": 5,
    "description": "Excelente organizador de cepillos para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 66,
    "name": "Comelón",
    "price": 1,
    "description": "Para manicure",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 67,
    "name": "Pastillas para limpiar lavadora",
    "price": 7,
    "description": "Contiene 12 pastillas",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 68,
    "name": "Polvo efecto espejo para uñas",
    "price": 16,
    "description": "Excelente polvo efecto espejo para uñas para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 69,
    "name": "Organizador de baño",
    "price": 14,
    "description": "Excelente organizador de baño para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 70,
    "name": "Papel toalla pequeño",
    "price": 3,
    "description": "Excelente papel toalla pequeño para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 71,
    "name": "Parlante y porta celular",
    "price": 20,
    "description": "Buen volumen",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 72,
    "name": "Set de percheros adhesivos",
    "price": 2,
    "description": "Es adhesivo",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 73,
    "name": "Masajeador para pies",
    "price": 14,
    "description": "Es recargable",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 74,
    "name": "Papel platino adhesivo",
    "price": 7,
    "description": "Contiene 5 metros",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 75,
    "name": "Patrullero",
    "price": 0.5,
    "description": "Excelente peine patrullero metálico para eliminar piojos y liendres de forma eficaz, ideal para el cuidado y la higiene personal.",
    "category": "Belleza y cuidado personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 76,
    "name": "Exprimidor de naranjas",
    "price": 30,
    "description": "Es recargable",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 77,
    "name": "Plantilla con talonera",
    "price": 6,
    "description": "Excelente plantilla con talonera para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 78,
    "name": "Perchero colgante",
    "price": 6,
    "description": "Metal resistente color negro",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 79,
    "name": "Secadora de zapatillas",
    "price": 25,
    "description": "Electrónico, en 2 horas estarán secas",
    "category": "Tecnología y Electrónica",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 80,
    "name": "Esponja facial",
    "price": 2,
    "description": "Ideal para difuminar el maquillaje",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 81,
    "name": "Caja de almacenamiento",
    "price": 18,
    "description": "Material poliéster, resistente, grande. Colores: marrón, celeste y gris",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 82,
    "name": "Encendedor a gas",
    "price": 3,
    "description": "Es a gas, dura un buen tiempo",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 83,
    "name": "Quita pelusa",
    "price": 7,
    "description": "Es lavable",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 84,
    "name": "Posa platos",
    "price": 2,
    "description": "Excelente posa platos para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 85,
    "name": "Libreta de notas",
    "price": 3,
    "description": "Excelente libreta de notas para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 86,
    "name": "Moledor manual",
    "price": 6,
    "description": "Ideal para pimienta, comino, sal",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 87,
    "name": "Lentes (día y noche)",
    "price": 6,
    "description": "Vienen 2, para día y noche",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 88,
    "name": "Uñas postizas",
    "price": 5,
    "description": "Viene con su pegamento",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 89,
    "name": "Limador para uñas de bebé",
    "price": 15,
    "description": "Funciona a pilas",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 90,
    "name": "Papel tisú",
    "price": 2,
    "description": "Por unidad",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 91,
    "name": "Pastilla para tanque de inodoro",
    "price": 2.5,
    "description": "Excelente pastilla para tanque de inodoro para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 92,
    "name": "Paleta para callos",
    "price": 1.5,
    "description": "Excelente paleta para callos para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 93,
    "name": "Resaltadores",
    "price": 3,
    "description": "Vienen 6 unidades",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 94,
    "name": "Set manicura y limpia oído",
    "price": 5,
    "description": "Excelente set manicura y limpia oído para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 95,
    "name": "Ambientador en spray",
    "price": 8,
    "description": "Excelente ambientador en spray para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 96,
    "name": "Forro de colchón",
    "price": 20,
    "description": "Poliéster, con cierre, para 2 plazas",
    "category": "Decoración y Textil",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 97,
    "name": "Cafetera francesa",
    "price": 20,
    "description": "1 litro",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 98,
    "name": "Cortina imantada",
    "price": 10,
    "description": "Excelente cortina imantada para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Decoración y Textil",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 99,
    "name": "Pulidor de callos",
    "price": 15,
    "description": "Es recargable",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 100,
    "name": "Reloj digital",
    "price": 20,
    "description": "Funciona a pilas o enchufado",
    "category": "Tecnología y Electrónica",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 101,
    "name": "Parche para pies",
    "price": 4,
    "description": "Excelente parche para pies para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 102,
    "name": "Corta uñas",
    "price": 2,
    "description": "Marca Delfin",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 103,
    "name": "Banco plegable",
    "price": 19,
    "description": "Excelente banco plegable para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 104,
    "name": "Alcohol 96°",
    "price": 1.5,
    "description": "Excelente alcohol 96° para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 105,
    "name": "Filtro de aceite",
    "price": 10,
    "description": "Acero inoxidable",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 106,
    "name": "Embudo",
    "price": 2,
    "description": "Excelente embudo para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 107,
    "name": "Set de peines",
    "price": 5,
    "description": "Vienen 12 unidades",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 108,
    "name": "Forro para sacos",
    "price": 4,
    "description": "Es resistente",
    "category": "Decoración y Textil",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 109,
    "name": "Caja de ligas",
    "price": 3,
    "description": "Excelente caja de ligas para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 110,
    "name": "Paquete de papel toalla",
    "price": 23,
    "description": "Vienen 40 rollos",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 111,
    "name": "Cinta de embalaje",
    "price": 10,
    "description": "Gruesa y reforzada, ideal para embalar cajas",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 112,
    "name": "Set de agujas",
    "price": 1,
    "description": "Excelente set de agujas para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 113,
    "name": "Ganchos",
    "price": 4,
    "description": "Excelente ganchos para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 114,
    "name": "Jabón líquido de mano",
    "price": 4.5,
    "description": "Excelente jabón líquido de mano para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 115,
    "name": "Porta cubiertos",
    "price": 4,
    "description": "Plástico, colores: verde, celeste, rosado",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 116,
    "name": "Peine desenredante",
    "price": 4,
    "description": "Excelente peine desenredante para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 117,
    "name": "Parlante (réplica Alexa)",
    "price": 30,
    "description": "Excelente parlante (réplica alexa) para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Tecnología y Electrónica",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 118,
    "name": "Cafetera italiana",
    "price": 25,
    "description": "Excelente cafetera italiana para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 119,
    "name": "Espátula y brocha pastelera",
    "price": 4,
    "description": "De silicona",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 120,
    "name": "Posa torta giratorio",
    "price": 10,
    "description": "Excelente posa torta giratorio para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 121,
    "name": "Cepillo para tomatodo",
    "price": 4,
    "description": "Para limpiar botellas",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 122,
    "name": "Set de 4 cuadernos de caligrafía",
    "price": 8,
    "description": "Viene con lapicero reutilizable",
    "category": "Juguetes y Librería",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 123,
    "name": "Talonera",
    "price": 10,
    "description": "Vienen 2 y es adhesivo",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 124,
    "name": "Liga para ejercicios",
    "price": 5,
    "description": "Excelente liga para ejercicios para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 125,
    "name": "Costurero",
    "price": 8,
    "description": "Ideal para viajes",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 126,
    "name": "Batidor de huevos",
    "price": 4,
    "description": "Funciona con pila",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 127,
    "name": "Joyero",
    "price": 12,
    "description": "Revestido de terciopelo",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 128,
    "name": "Parche facial",
    "price": 5,
    "description": "Vienen 24 unidades para cubrir granitos",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 129,
    "name": "Colete",
    "price": 1,
    "description": "Excelente colete para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 130,
    "name": "Medias de silicona",
    "price": 7,
    "description": "Por dentro de la media viene la silicona",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 131,
    "name": "Espuma anti grasa",
    "price": 9,
    "description": "Excelente espuma anti grasa para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 132,
    "name": "Tajador modelo cámara",
    "price": 5,
    "description": "Viene con borrador y limpiador",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 133,
    "name": "Paquete de papel higiénico",
    "price": 8,
    "description": "Viene 4, son gruesos",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 134,
    "name": "Rizador de pestañas",
    "price": 3,
    "description": "Excelente rizador de pestañas para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 135,
    "name": "Manguera expandible",
    "price": 22,
    "description": "30 metros",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 136,
    "name": "Anti ronquido",
    "price": 4,
    "description": "Vienen 4 unidades",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 137,
    "name": "Piquetero",
    "price": 2,
    "description": "Excelente piquetero para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 138,
    "name": "Cubeta de hielo",
    "price": 4,
    "description": "Con tapa y silicona",
    "category": "Cocina y Hogar",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 139,
    "name": "Ventilador de cuello",
    "price": 15,
    "description": "Color verde",
    "category": "Tecnología y Electrónica",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 140,
    "name": "Libro Coquito",
    "price": 17,
    "description": "Es grande",
    "category": "Juguetes y Librería",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 141,
    "name": "Caja para joyas (rectangular)",
    "price": 2,
    "description": "Excelente caja para joyas (rectangular) para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 142,
    "name": "Caja para joyas (circular)",
    "price": 2,
    "description": "Excelente caja para joyas (circular) para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 143,
    "name": "Ungüento cannabis",
    "price": 5,
    "description": "Excelente ungüento cannabis para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 144,
    "name": "Quita Ya",
    "price": 3,
    "description": "Ideal para quitar manchas de óxido en la ropa",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 145,
    "name": "Pastillero",
    "price": 5,
    "description": "9 cm x 13 cm",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 146,
    "name": "Yogurera con porta cereal",
    "price": 6,
    "description": "De acrílico, viene con cuchara",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 147,
    "name": "Toalla reutilizable facial",
    "price": 6,
    "description": "Excelente toalla reutilizable facial para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 148,
    "name": "Algodón",
    "price": 2,
    "description": "Excelente algodón para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 149,
    "name": "Pastillero semanal",
    "price": 6,
    "description": "Excelente pastillero semanal para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 150,
    "name": "Lonchera 3 niveles",
    "price": 15,
    "description": "3 niveles",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 151,
    "name": "Calculadora Kawai",
    "price": 6,
    "description": "Funciona a pila",
    "category": "Tecnología y Electrónica",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 152,
    "name": "Set de imperdibles/prendedores",
    "price": 8,
    "description": "Vienen 10 unidades",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 153,
    "name": "Forro de lavadora",
    "price": 8,
    "description": "Plástico grueso, para 8 kilos",
    "category": "Decoración y Textil",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 154,
    "name": "Hilo dental",
    "price": 4,
    "description": "Excelente hilo dental para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 155,
    "name": "Paquete de papel élite",
    "price": 8,
    "description": "Vienen 4, rendidor",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 156,
    "name": "Cinta doble contacto",
    "price": 3,
    "description": "Set 2 cintas",
    "category": "Ferretería y Accesorios",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 157,
    "name": "Plumón permanente",
    "price": 1,
    "description": "Excelente plumón permanente para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 158,
    "name": "Set frascos acrílicos",
    "price": 10,
    "description": "Ideal para algodón e hisopos",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 159,
    "name": "Gafas anti migraña",
    "price": 10,
    "description": "Excelente gafas anti migraña para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 160,
    "name": "Organizador de cables",
    "price": 10,
    "description": "Vienen 10 piezas",
    "category": "Organización",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 161,
    "name": "Pack de cepillos para hendidura",
    "price": 4,
    "description": "Vienen 2",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 162,
    "name": "Paños metálicos",
    "price": 4,
    "description": "Contiene 6 unidades, muy buenos y resistentes",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 163,
    "name": "Set de mallas para lavadora",
    "price": 10,
    "description": "Vienen 4 con cierre y para brasier",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 164,
    "name": "Cubre alimentos",
    "price": 6,
    "description": "Es de tul",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 165,
    "name": "Sombrilla para cartera",
    "price": 15,
    "description": "Color guinda",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 166,
    "name": "Foco sensor (grande)",
    "price": 10,
    "description": "Ideal para zonas de tránsito",
    "category": "Tecnología y Electrónica",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 167,
    "name": "Toallitas desmaquillantes",
    "price": 3,
    "description": "Vienen 25 unidades",
    "category": "Belleza y Cuidado Personal",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 168,
    "name": "Mini ventilador",
    "price": 7,
    "description": "Recargable, 3 niveles. Colores: azul, blanco y melón",
    "category": "Tecnología y Electrónica",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  },
  {
    "id": 169,
    "name": "Dispensador de agua",
    "price": 10,
    "description": "Es recargable",
    "category": "Hogar y Estilo de Vida",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
  }
];

export const mapProductCategory = (category: string, name: string): string => {
  const cat = String(category || '').trim();
  const lowerName = String(name || '').toLowerCase();

  if (lowerName === 'patrullero' || lowerName.includes('peine patrullero')) {
    return 'Belleza y cuidado personal';
  }

  if (lowerName.includes('perfume')) {
    return 'Belleza y cuidado personal';
  }

  // Name-based overrides to align precisely with user specifications
  if (
    lowerName.includes('facial') ||
    lowerName.includes('cejas') ||
    lowerName.includes('pestañas') ||
    lowerName.includes('brocha') ||
    lowerName.includes('maquillaje') ||
    lowerName.includes('espejo') ||
    lowerName.includes('depilador') ||
    lowerName.includes('rasuradora') ||
    lowerName.includes('desmaquillador') ||
    lowerName.includes('desmaquillante') ||
    lowerName.includes('uñas') ||
    lowerName.includes('manicura') ||
    lowerName.includes('manicure') ||
    lowerName.includes('cutis') ||
    lowerName.includes('cara') ||
    lowerName.includes('brochas')
  ) {
    return 'Belleza y cuidado personal';
  }

  if (
    lowerName.includes('cuaderno') ||
    lowerName.includes('libreta') ||
    lowerName.includes('notas') ||
    lowerName.includes('coquito') ||
    lowerName.includes('resaltador') ||
    lowerName.includes('resaltadores') ||
    lowerName.includes('plumón') ||
    lowerName.includes('tajador') ||
    lowerName.includes('juguete') ||
    lowerName.includes('mascota') ||
    lowerName.includes('perrito') ||
    lowerName.includes('gatito')
  ) {
    return 'Mascotas, juguetes y librerías';
  }

  if (
    lowerName.includes('taper') ||
    lowerName.includes('fuentes') ||
    lowerName.includes('lavadora') ||
    lowerName.includes('aceitero') ||
    lowerName.includes('azucarera') ||
    lowerName.includes('cubiertos') ||
    lowerName.includes('hielo') ||
    lowerName.includes('cafetera') ||
    lowerName.includes('escurridor') ||
    lowerName.includes('empanadas') ||
    lowerName.includes('batidor') ||
    lowerName.includes('antigrasa') ||
    lowerName.includes('anti grasa') ||
    lowerName.includes('cocina') ||
    lowerName.includes('refrigeradora') ||
    lowerName.includes('posa platos') ||
    lowerName.includes('posa plato') ||
    lowerName.includes('moledor')
  ) {
    return 'Cocina y hogar';
  }

  // Base category mappings
  switch (cat) {
    case 'Belleza y Cuidado Personal':
    case 'Belleza':
    case 'Belleza y cuidado personal':
      return 'Belleza y cuidado personal';
    case 'Cocina y Hogar':
    case 'Cocina':
    case 'Cocina y hogar':
      return 'Cocina y hogar';
    case 'Mascotas':
    case 'Juguetes y Librería':
    case 'Mascotas, juguetes y librerías':
      return 'Mascotas, juguetes y librerías';
    case 'Hogar y Estilo de Vida':
    case 'Hogar y estilo de vida':
    case 'Decoración y Textil':
    case 'Organización':
    case 'Ferretería y Accesorios':
    case 'Ferretería':
    case 'Tecnología y Electrónica':
    default:
      return 'Hogar y estilo de vida';
  }
};

export const productsData: Product[] = rawProductsData.map(p => {
  const finalCategory = mapProductCategory(p.category, p.name);
  let finalName = p.name;
  let finalDesc = p.description;

  // Make sure Patrullero is clean
  if (p.id === 75) {
    finalName = "Patrullero";
    finalDesc = "Excelente peine patrullero metálico para eliminar piojos y liendres de forma eficaz, ideal para el cuidado y la higiene personal.";
  }

  return {
    ...p,
    name: finalName,
    description: finalDesc,
    category: finalCategory
  };
});
