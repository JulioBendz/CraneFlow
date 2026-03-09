# 🏗️ CraneFlow

**CraneFlow** es una solución profesional de gestión y monitoreo satelital para servicios de grúas y auxilio mecánico. Diseñada con estándares de alta gama para ofrecer una experiencia táctica, segura y en tiempo real.

---

## 🚀 Tecnologías Core

*   **Backend**: .NET 8 (C#) con **Clean Architecture** y **DDD**.
*   **Base de Datos**: MS SQL Server 2022 + **Dapper** (Rendimiento Extremo).
*   **Frontend**: React + Vite + TypeScript con **Tailwind CSS**.
*   **Tiempo Real**: SignalR (WebSockets) para telemetría continua.
*   **Despliegue**: Docker & Docker Compose.
*   **Seguridad**: Nginx como Proxy Reverso + Let's Encrypt (SSL).

---

## 🛰️ Funcionalidades Estrella

1.  **Monitor Táctico (Admin)**: Radar en tiempo real de toda la flota con estados dinámicos (LIBRE/EN RUTA).
2.  **Rastreo Satelital**: Trazado de rutas inteligentes desde la grúa hasta la incidencia y el destino final.
3.  **Gestión de Incidentes**: Sistema de recepción de solicitudes de auxilio mecánico para socios.
4.  **Panel del Conductor**: Interfaz optimizada para smartphone con GPS integrado.

---

## 📂 Estructura del Proyecto

*   `CraneFlow.Domain`: Reglas de negocio y entidades core.
*   `CraneFlow.Application`: Casos de uso y orquestación de SignalR.
*   `CraneFlow.Infrastructure`: Implementación de Dapper y Scripts SQL.
*   `CraneFlow.API`: Controladores REST y el Hub de comunicación satelital.
*   `CraneFlow.Web`: Interfaz de usuario reactiva y moderna.

---

## 🛠️ Desarrollo Local

### Requisitos
*   .NET 8 SDK
*   Node.js 18+
*   Docker Desktop (Para SQL Server)

### Configuración
1.  Clona el repositorio.
2.  Levanta la base de datos con Docker: `docker compose up sql-server -d`.
3.  Corre el backend: `dotnet run --project CraneFlow.API`.
4.  Corre el frontend: `cd CraneFlow.Web && npm run dev`.

---

## 🚢 Despliegue en Producción

El proyecto está diseñado para desplegarse mediante contenedores en cualquier VPS:

```bash
# En el VPS
git pull origin main
docker compose up --build -d
```

> [!IMPORTANT]
> Para detalles profundos sobre el despliegue y la seguridad, consulta [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## 🔍 Guías Técnicas Avanzadas

*   **[DOCUMENTATION.md](./DOCUMENTATION.md)**: Arquitectura detallada y guía de mantenimiento.
*   **[SIGNALR_DEEP_DIVE.md](./SIGNALR_DEEP_DIVE.md)**: Inmersión técnica en el sistema de rastreo y WebSockets.

---
*Desarrollado para la excelencia operativa. 🏁🦾🛰️🏆*
