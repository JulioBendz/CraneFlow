import axios from 'axios';

// La URL base usualmente va en variables de entorno (.env)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7196/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar las respuestas ApiResponse genéricas
apiClient.interceptors.response.use(
  (response) => {
    // Si la API devuelve un ApiResponse<T>, extraemos el Payload si deseamos, o devolvemos todo.
    // Según tu regla, devuelves el contrato original para que el Frontend lo lea.
    return response.data;
  },
  (error) => {
    // Si hay un error, capturamos el ApiResponse del body de error devuelto por la API (Middleware)
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    
    // Si no es un ApiResponse devuelto por nuestro server (.NET)
    return Promise.reject({
      success: false,
      message: error.message || 'Error de conexión',
      code: 'NETWORK_ERROR',
      data: null,
      errors: []
    });
  }
);

export default apiClient;
