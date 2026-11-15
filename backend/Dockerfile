# ==========================================
# Stage 1: Build Spring Boot Application
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /helpdesk-backend

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Run Spring Boot Application
# ==========================================
FROM eclipse-temurin:21-jre

# Install curl for Docker health checks
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /helpdesk-backend

COPY --from=build /helpdesk-backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
