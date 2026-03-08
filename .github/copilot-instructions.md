# 📜 PROYECTOS - ESTÁNDARES DE DESARROLLO Y BUENAS PRÁCTICAS

Este documento establece las directrices obligatorias para el desarrollo de software, garantizando **mantenibilidad, escalabilidad y alto rendimiento**.

---

## 1. ARQUITECTURA DE SISTEMAS (.NET 8)

Se implementa **Clean Architecture** con **Domain-Driven Design (DDD)**. La solución se divide en proyectos independientes:

* **`TACP.CraneFlow.Domain` (Core):** Entidades, interfaces de repositorios, excepciones de negocio y lógica pura. *Sin dependencias externas.*
* **`TACP.CraneFlow.Application`:** Casos de uso, DTOs, Mappers y orquestación.
* **`TACP.CraneFlow.Infrastructure`:** Implementación de **Dapper**, acceso a SQL Server, Clients de APIs externas y Logging (**NLog**).
* **`TACP.CraneFlow.API` (Web API):** Controladores, Hubs de **SignalR**, configuración de Middleware y JWT.
* **`TACP.CraneFlow.Web` (Frontend):** Proyecto independiente en **React + Vite**.

---

## 2. ESTÁNDARES DE CÓDIGO (CLEAN CODE)

### Nomenclatura Estricta

| Contexto | Convención | Ejemplo |
| --- | --- | --- |
| **Clases C#** | `PascalCase` (Singular) | `Servicio`, `ConductorRepository` |
| **Interfaces** | `IPascalCase` | `IServicioRepository` |
| **Métodos** | `PascalCase` (Verbo) | `CrearServicioAsync()` |
| **Variables Locales** | `camelCase` | `idServicio`, `listaConductores` |
| **JSON / JavaScript** | `camelCase` | `idSocio`, `fechaCreacion` |
| **CSS / URLs** | `kebab-case` | `.btn-primary`, `/api/v1/gestion-grueas` |

### Documentación

* Todo método público **DEBE** llevar comentarios XML `/// <summary>`.
* No comentar "qué" hace el código (el código debe ser expresivo), comentar el "porqué" en lógicas complejas.

---

## 3. PERSISTENCIA Y BASE DE DATOS (SQL SERVER)

### Acceso a Datos (Dapper)

* **Prohibido:** SQL en el código C# (Hardcoded strings).
* **Obligatorio:** Uso exclusivo de **Stored Procedures (SPs)** para operaciones de escritura (Ins, Upd, Del).
* **Rendimiento:** Usar `QueryAsync` y `ExecuteAsync` para no bloquear el hilo de ejecución.

### Estándar SQL

* **Nomenclatura SPs:** `usp_` + `Tabla` + `Acción` (Ej: `usp_ServiciosIns`, `usp_ServiciosSel`).
* **Parámetros:** `@p` + `Nombre` (Ej: `@pIdSocio`).
* **Auditoría:** Todas las tablas de negocio deben incluir:
* `UsuarioModificacion` (VARCHAR 50)
* `FechaModificacion` (DATETIME)
* `IPModificacion` (VARCHAR 20)
* `Eliminado` (BIT) -> **Borrado Lógico**.

---

## 4. COMUNICACIÓN Y REAL-TIME (SIGNALR)

* **Hubs:** Ubicados en la capa API.
* **Interfaces:** Las notificaciones se disparan desde la capa de **Application** mediante la inyección de `IHubContext`.
* **Grupos:** Segmentar conexiones en grupos (`Groups.AddToGroupAsync`) para evitar tráfico innecesario (Ej: Grupo "Conductores").

---

## 5. ESTÁNDARES DE API REST

### Respuestas Estándar (`ApiResponse<T>`)

Todas las APIs deben devolver este contrato único para facilitar el consumo del Frontend:

```csharp
public class ApiResponse<T> {
    public bool Success { get; set; }
    public string Message { get; set; }
    public string Code { get; set; } // Ej: "OPERATION_SUCCESS", "VALIDATION_ERROR"
    public T Data { get; set; }
    public List<string> Errors { get; set; }
}
```

### Seguridad

* **JWT:** Autenticación obligatoria para endpoints privados.
* **CORS:** Configurado estrictamente para el dominio del Frontend.
* **HTTPS:** Obligatorio en todos los entornos.

---

## 6. FRONTEND (REACT MODERNO)

* **Tecnología:** React 18+ con **Vite** y **TypeScript** (Recomendado por robustez).
* **Estilos:** **Tailwind CSS** (Eficiencia) o **Bootstrap 5** (Estándar corporativo).
* **Estado:** `Context API` o `Zustand` para estados globales livianos.
* **Hooks:** Lógica de SignalR encapsulada en `useSignalR.js` personalizado.

---

## 7. GESTIÓN DE ERRORES Y LOGGING

* **Global Exception Handling:** Middleware en la API para capturar errores no controlados y devolver un `ApiResponse` con código 500.
* **Logging:** **NLog** configurado para escribir en archivos rotativos (`/logs/error-.log`).
* **SQL:** Bloques `TRY...CATCH` dentro de los Stored Procedures con retorno de códigos de error.

---

## 8. DEVOPS Y HERRAMIENTAS

* **Docker:** SQL Server 2022 siempre en contenedor para paridad de entornos.
* **Git:**
* Commits en español, presente simple: "Agrega validación de socio".
* Ramas: `main` (producción), `develop` (desarrollo).
* **Postman:** Colecciones documentadas para pruebas de integración.
