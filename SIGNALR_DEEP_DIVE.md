# 📡 CraneFlow - Inmersión Técnica en SignalR & WebSockets

Este documento detalla la columna vertebral de CraneFlow: su sistema de comunicación bidireccional en tiempo real. Aquí aprenderás cómo funciona el flujo de datos, por qué es eficiente y cómo auditarlo como un experto.

---

## 🛠️ 1. ¿Cómo verificar WebSockets en el Navegador?

Para confirmar que **CraneFlow** no está usando técnicas antiguas (como Long Polling) y está operando con **WebSockets puros**, sigue estos pasos:

1.  Presiona `F12` para abrir las herramientas de desarrollador.
2.  Ve a la pestaña **Network (Red)**.
3.  Filtra por **WS** (WebSockets).
4.  Refresca la página (`F5`).
5.  Verás una entrada llamada `cranehub?id=...`.
6.  Haz clic en ella y ve a la sub-pestaña **Messages**.
7.  **¡Magia!** Verás bloques de texto JSON fluyendo en tiempo real sin que la página se refresque.

> [!TIP]
> Si el estado es `101 Switching Protocols`, significa que Nginx y .NET negociaron exitosamente el túnel de subida a WebSocket.

---

## 🏗️ 2. Arquitectura de Telemetría: "Smart Flow"

A diferencia de sistemas básicos, CraneFlow **no satura la base de datos** con cada movimiento del GPS. Implementamos una estrategia de **Memoria Volátil vs Persistencia Selectiva**.

### 🔄 El Ciclo de Vida de una Coordenada
1.  **Captura (Nivel 0)**: El sensor GPS del móvil envía lat/lng cada 3-5 segundos (o al moverse 10 metros).
2.  **Transmisión (Nivel 1)**: SignalR envía esta data al `CraneHub.ActualizarUbicacion`.
3.  **Filtrado en RAM (Nivel 2)**: El servidor **NO guarda esto en SQL Server**. ¿Por qué? Porque guardar miles de coordenadas por segundo destruiría el rendimiento del disco.
4.  **Broadcast (Nivel 3)**: El servidor reenvía el mensaje a los clientes interesados (Admins y el Socio asignado) usando la memoria RAM de .NET.
5.  **Persistencia (Nivel 4)**: Solo se escribe en la base de datos cuando el estado de la solicitud cambia (ej: de "Pendiente" a "En Camino").

---

## 🧩 3. Integración de Código Punto a Punto

### A. El Servidor (.NET 8 Hub)
Archivo: `CraneFlow.API/Hubs/CraneHub.cs`
Es el "Switchboard" central. Utiliza `Groups` para segmentar el tráfico:
*   `Groups.AddToGroupAsync(Context.ConnectionId, "Administradores")`: Registra a los jefes para ver el radar global.
*   `Groups.AddToGroupAsync(Context.ConnectionId, $"Socio_{idSocio}")`: Crea un canal privado para que el cliente vea su grúa.

### B. El Cliente (React Hook)
Archivo: `CraneFlow.Web/src/hooks/useSignalR.js`
Encapsula la complejidad del protocolo:
```javascript
const connection = new HubConnectionBuilder()
    .withUrl(import.meta.env.VITE_HUB_URL)
    .withAutomaticReconnect() // Autoreparación de conexión si el túnel falla
    .build();
```

---

## ⚖️ 4. Escalabilidad y Rendimiento

### El rol de Nginx en Producción
En tu VPS, el archivo `nginx-host.conf` tiene estas líneas críticas:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```
Sin esto, el tráfico WebSocket se degradaría a HTTP normal, causando lags de 1-2 segundos. Con esto, la latencia es de **menos de 50ms**.

### Consumo de Recursos
*   **CPU**: Mínimo, SignalR usa serialización JSON binaria optimizada.
*   **DB**: Cero impacto durante el rastreo (solo impacto en cambios de estado).
*   **Red**: Paquetes de apenas 200 bytes por actualización.

---
*Este documento es parte de la ingeniería de CraneFlow. Diseñado para alta disponibilidad y baja latencia.* 🛰️🦾🏁
