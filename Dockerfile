# Stage 1: Build Frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build -- --configuration production --base-href=/

# Stage 2: Build Backend
FROM eclipse-temurin:23-jdk AS backend-build
WORKDIR /app
ARG MAVEN_VERSION=3.9.6
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL -o /tmp/maven.tar.gz https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
    && tar -xzf /tmp/maven.tar.gz -C /usr/local/ \
    && ln -s /usr/local/apache-maven-${MAVEN_VERSION}/bin/mvn /usr/bin/mvn \
    && rm /tmp/maven.tar.gz \
    && apt-get purge -y curl && apt-get autoremove -y && apt-get clean
COPY pom.xml ./
COPY src ./src
COPY --from=frontend-build /app/frontend/dist/frontend/browser ./src/main/resources/static
RUN mvn dependency:go-offline
RUN mvn resources:resources
RUN mvn package -DskipTests -Dfrontend.skip=true
RUN jar tf target/dice-counter-0.0.1-SNAPSHOT.jar | grep static || echo "No static files found"

# Stage 3: Runtime
FROM eclipse-temurin:23-jre
WORKDIR /app
COPY --from=backend-build /app/target/dice-counter-0.0.1-SNAPSHOT.jar app.jar
#VOLUME /data
RUN mkdir -p /app/data
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]