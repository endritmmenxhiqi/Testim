# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Kopjo skedarin e projektit dhe bëj restore
COPY Backend.csproj ./
RUN dotnet restore

# Kopjo të gjithë kodin dhe bëj publish
COPY . ./
RUN dotnet publish -c Release -o out

# 2. Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Render përdor portën 80 ose 10000, kjo i thotë aplikacionit të dëgjojë kudo
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "Backend.dll"]