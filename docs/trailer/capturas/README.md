# Capturas del trailer

Las imágenes (258 PNG a 2x, ~300 MB) **no se versionan**: se regeneran con el script. Las hojas de contacto de `hojas/` sí.

    NEXT_PUBLIC_BRAND=tutienda PAGES_BASE_PATH=/supplements-ecommerce npm run build
    node scripts/trailer-capture.mjs            # todas (≈13 min)
    node scripts/trailer-capture.mjs '' mostrador   # solo las que tengan 'mostrador' en el id

Salida: `capturas/{tienda|panel}/<id>-<1440|390>-<light|dark>.png`. Inventario y selectores: `biblia/ui.md`.
