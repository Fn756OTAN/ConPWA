# 🎬 CineDetalle — PWA

Página web progresiva (PWA) para visualizar información detallada de películas usando la API de TMDB.

## Características PWA

- ✅ **Instalable** en Android, iOS, Chrome, Edge, etc.
- ✅ **Funciona offline** gracias al Service Worker
- ✅ **Caché inteligente** de imágenes y datos de la API
- ✅ **Banner de instalación** nativo

## Estructura de archivos

```
├── index.html          # HTML principal con meta tags PWA
├── style.css           # Estilos + estilos del banner/toast
├── app.js              # Lógica principal de la app
├── pwa.js              # Registro del SW + lógica de instalación
├── sw.js               # Service Worker (caché offline)
├── manifest.json       # Web App Manifest
├── config.js           # ⚠️ Tu API key (NO subir a GitHub)
├── config.example.js   # Plantilla de config sin API key
├── icons/
│   ├── icon-192.png    # Ícono PWA 192x192
│   └── icon-512.png    # Ícono PWA 512x512
└── .gitignore          # Excluye config.js
```

## Configuración

1. Copia `config.example.js` → `config.js`
2. Reemplaza `tu_api_key_aqui` con tu API key de [TMDB](https://www.themoviedb.org/settings/api)
3. Abre `index.html` en un servidor local (no funciona con `file://`)

## Servidor local rápido

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# VSCode → Live Server extension
```

## Estrategia de caché del Service Worker

| Recurso | Estrategia |
|---|---|
| Archivos estáticos (HTML, CSS, JS) | Cache first (precacheo al instalar) |
| API de TMDB | Network first → fallback a caché |
| Imágenes de TMDB | Cache first → guardar automáticamente |
| Fuentes de Google | Cache first |

## Notas para iOS (Safari)

En iOS, el banner "Instalar" no se muestra automáticamente.  
El usuario debe: Safari → Compartir → "Añadir a pantalla de inicio"
