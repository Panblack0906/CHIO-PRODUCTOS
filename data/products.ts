export interface DashboardProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
}

export const products: DashboardProduct[] = [
  {
    "id": "1",
    "name": "Cepillo para mascota",
    "price": 6,
    "description": "A vapor, es recargable",
    "imageUrl": "/images/products1/parte1/imagen_001.png",
    "category": "Mascotas"
  },
  {
    "id": "15",
    "name": "Espejo LED",
    "price": 7,
    "description": "Viene con luz LED, es recargable",
    "imageUrl": "/images/products1/parte1/imagen_015.png",
    "category": "Belleza y Cuidado Personal"
  },
  {
    "id": "23",
    "name": "Taper",
    "price": 11,
    "description": "Material pirex, apto para microondas",
    "imageUrl": "/images/products1/parte1/imagen_023.png",
    "category": "Cocina y Hogar"
  },
  {
    "id": "29",
    "name": "Perfume",
    "price": 70,
    "description": "Yanbal",
    "imageUrl": "/images/products1/parte1/imagen_029.png",
    "category": "Hogar y Estilo de Vida"
  },
  {
    "id": "41",
    "name": "Sombrilla",
    "price": 12,
    "description": "Colores: anaranjado, azul, marrón, verde, lila",
    "imageUrl": "/images/products1/parte1/imagen_041.png",
    "category": "Hogar y Estilo de Vida"
  },
  {
    "id": "56",
    "name": "Tomatodo",
    "price": 10,
    "description": "1 lt, es de acrílico",
    "imageUrl": "/images/products1/parte1/imagen_056.png",
    "category": "Hogar y Estilo de Vida"
  },
  {
    "id": "117",
    "name": "Parlante (réplica Alexa)",
    "price": 30,
    "description": "Excelente parlante (réplica alexa) para uso diario, con la mejor relación de calidad y precio en CHIO Productos.",
    "imageUrl": "/images/products1/parte1/imagen_117.png",
    "category": "Tecnología y Electrónica"
  },
  {
    "id": "169",
    "name": "Dispensador de agua",
    "price": 10,
    "description": "Es recargable",
    "imageUrl": "/images/products1/parte1/imagen_169.png",
    "category": "Hogar y Estilo de Vida"
  }
];
