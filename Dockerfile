# Stage 1: Build Frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ .
RUN npm run build -- --configuration production

# Stage 2: Build Backend with Maven installed
FROM eclipse-temurin:23-jdk AS backend-build
WORKDIR /app/backend
# Install Maven 3.9.6
ARG MAVEN_VERSION=3.9.6
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL -o /tmp/maven.tar.gz https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
    && tar -xzf /tmp/maven.tar.gz -C /usr/local/ \
    && ln -s /usr/local/apache-maven-${MAVEN_VERSION}/bin/mvn /usr/bin/mvn \
    && rm /tmp/maven.tar.gz \
    && apt-get purge -y curl && apt-get autoremove -y && apt-get clean
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