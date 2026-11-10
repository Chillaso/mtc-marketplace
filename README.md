# María te Cuida · Demo web

Demo funcional del marketplace de cuidado de personas de **María te Cuida**, construida a partir de
`Maria_te_Cuida.pptx`, la hoja de ruta y el mapa conceptual. Todos los datos son ficticios y se guardan
en el `localStorage` del navegador (no hay backend).

**Demo publicada:** https://chillaso.github.io/mtc-marketplace/ (se despliega automáticamente con cada push a `main`).

## Arrancar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción en dist/
```

## Guion de demo sugerido

Usa el botón flotante **Demo** (abajo a la izquierda) para cambiar de rol en cualquier momento o reiniciar los datos.

1. **Inicio** (`/`): hero con «Necesito una cuidadora» / «Quiero trabajar como cuidadora».
2. **Familia** (Lucía Martínez): `Buscar cuidadora` → filtros «Encuentra a tu cuidadora ideal» → resultados →
   perfil completo → ♥ favorita (privada) → **Solicitar contacto** a *Ana G.*
3. **Cambiar a Cuidadora** (Ana García): panel con botón Disponible/No disponible, solicitud nueva →
   **Aceptar** → match confirmado y chat privado.
4. **Volver a Familia**: el chat con Ana ya está abierto. En el chat con *Laura M.* la cuidadora responde
   automáticamente; también se puede proponer videollamada, compartir documentos y añadir notas privadas.
5. Las solicitudes a cuidadoras que no son cuentas demo se pueden aceptar con «Simular que la cuidadora acepta».
6. **Registro de cuidadora** (`/registro/cuidadora`): 6 pasos con validación; el enlace
   «Rellenar con datos de ejemplo» agiliza la demo.
7. **Servicio integral** (`/servicio-integral`) y **Documentación y confianza** (`/confianza`).

## Estructura

```
src/
  data/        catálogos, tipos, cuidadoras mock y semilla de la demo
  store.tsx    estado global (sesión, solicitudes, mensajes, notificaciones…) con persistencia
  components/  UI común, layout, formulario de cuidadora por pasos, vista de perfil
  pages/       landing, auth, registro, área de cuidadora, búsqueda, perfil, cuenta de familia, mensajes
scripts/crop-assets.mjs   recorta logo y fotos desde las diapositivas del .pptx
```

## Fuera de alcance (pendiente de definir con el equipo)

Pasarela de pagos, planes y precios, criterios de verificación de documentos, calculadora de presupuestos,
panel de control de la empresa y condiciones del servicio integral.
