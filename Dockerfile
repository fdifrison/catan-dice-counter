# Stage 1: Build Frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ .
RUN npm run build -- --configuration production

# Stage 2: Build Backend
FROM maven:3.9.6-eclipse-temurin-23 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/ .
COPY --from=frontend-build /app/frontend/dist/catan-tracker /app/backend/src/main/resources/static
RUN mvn package -DskipTests

# Stage 3: Run with JDK 23 and 256MB RAM limit
FROM eclipse-temurin:23-jdk
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]