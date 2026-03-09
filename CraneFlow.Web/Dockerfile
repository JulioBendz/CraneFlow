# Stage 1: Build React
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar código fuente y construir
COPY . .
# Asegurarse que las variables de entorno se inyecten en el build (si es necesario)
# ARG VITE_API_URL
# ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
