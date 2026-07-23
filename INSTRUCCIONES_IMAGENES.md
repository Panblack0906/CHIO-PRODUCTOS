# 📸 Instrucciones para Cargar las Imágenes de Productos

## ✅ Lo que ya está listo:

La aplicación está configurada para cargar **169 imágenes de productos** desde la carpeta:
```
/workspaces/default/code/public/images/products/
```

## 📋 Pasos para agregar las imágenes (ARCHIVO ZIP):

### 1️⃣ Descarga el ZIP del Google Drive
   - URL: https://drive.google.com/drive/folders/1g2HRWFG53-7zmzbRA8K96RsOYYBNKcil
   - Descarga todas las imágenes como ZIP

### 2️⃣ Sube el archivo ZIP
   Coloca el archivo ZIP en la carpeta del proyecto:
   ```
   /workspaces/default/code/
   ```

### 3️⃣ Ejecuta el script automático
   Abre una terminal y ejecuta:
   ```bash
   ./extraer_imagenes.sh
   ```
   
   El script automáticamente:
   - ✅ Descomprimirá el ZIP
   - ✅ Renombrará las imágenes (001.jpg, 002.jpg, etc.)
   - ✅ Las copiará a `/public/images/products/`

### 4️⃣ ¡Listo!
   La aplicación cargará automáticamente las imágenes reales.

## 📝 Notas importantes:

- ✅ Los nombres DEBEN tener 3 dígitos con ceros a la izquierda (001, 002, 003...)
- ✅ La extensión puede ser .jpg, .jpeg, .png o .webp
- ✅ Si una imagen no se encuentra, se mostrará un placeholder
- ✅ No necesitas editar código, solo copiar las imágenes

## 🔍 Verificación:

Para verificar que las imágenes se cargaron correctamente, abre la aplicación y revisa que los productos muestren las fotos reales en lugar de los placeholders.
