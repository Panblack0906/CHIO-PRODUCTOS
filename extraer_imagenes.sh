#!/bin/bash

# Script para descomprimir y organizar las imágenes de productos

echo "🔍 Buscando archivo ZIP..."

# Buscar el archivo ZIP (busca en la raíz del proyecto y carpetas comunes)
ZIP_FILE=$(find /workspaces/default/code -maxdepth 2 -name "*.zip" -type f | head -n 1)

if [ -z "$ZIP_FILE" ]; then
    echo "❌ No se encontró ningún archivo ZIP"
    echo "📁 Por favor, sube el archivo ZIP a la carpeta del proyecto"
    exit 1
fi

echo "✓ Encontrado: $ZIP_FILE"
echo ""

# Crear carpeta temporal para extracción
TEMP_DIR="/tmp/productos_temp"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

echo "📦 Descomprimiendo archivo..."
unzip -q "$ZIP_FILE" -d "$TEMP_DIR"

echo "✓ Archivos extraídos"
echo ""

# Crear carpeta de destino si no existe
mkdir -p /workspaces/default/code/public/images/products

echo "🔄 Organizando imágenes..."

# Contador
count=0

# Buscar todos los archivos de imagen y ordenarlos
find "$TEMP_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | sort | while read file; do
    # Extraer el nombre del archivo
    filename=$(basename "$file")

    # Intentar extraer el número del nombre del archivo
    if [[ $filename =~ ^0*([0-9]+) ]]; then
        num="${BASH_REMATCH[1]}"
        # Formatear con ceros a la izquierda
        padded=$(printf "%03d" $num)

        # Obtener extensión
        ext="${filename##*.}"

        # Copiar con el nuevo nombre
        cp "$file" "/workspaces/default/code/public/images/products/${padded}.jpg"
        echo "  ✓ $filename → ${padded}.jpg"
        ((count++))
    fi
done

echo ""
echo "✅ Proceso completado!"
echo "📊 Total de imágenes procesadas: $count"
echo ""
echo "🎨 Las imágenes están listas en: /public/images/products/"
echo "🚀 Puedes abrir la aplicación para ver los productos con imágenes reales"

# Limpiar carpeta temporal
rm -rf "$TEMP_DIR"
