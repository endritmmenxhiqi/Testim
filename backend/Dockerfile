# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY Backend.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

# 2. Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Konfigurimi i portës 80
ENV ASPNETCORE_URLS=http://0.0.0.0:80
EXPOSE 80

ENTRYPOINT ["dotnet", "Backend.dll"]