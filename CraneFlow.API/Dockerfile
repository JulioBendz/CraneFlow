# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar proyectos y restaurar dependencias
COPY ["CraneFlow.API/CraneFlow.API.csproj", "CraneFlow.API/"]
COPY ["CraneFlow.Application/CraneFlow.Application.csproj", "CraneFlow.Application/"]
COPY ["CraneFlow.Domain/CraneFlow.Domain.csproj", "CraneFlow.Domain/"]
COPY ["CraneFlow.Infrastructure/CraneFlow.Infrastructure.csproj", "CraneFlow.Infrastructure/"]
RUN dotnet restore "CraneFlow.API/CraneFlow.API.csproj"

# Copiar todo el código y compilar
COPY . .
WORKDIR "/src/CraneFlow.API"
RUN dotnet build "CraneFlow.API.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "CraneFlow.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Puerto por defecto de .NET 8
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "CraneFlow.API.dll"]
