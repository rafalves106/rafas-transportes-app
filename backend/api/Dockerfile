FROM maven:3.8.5-openjdk-17 AS build

WORKDIR /app

COPY backend/api/pom.xml .
RUN mvn dependency:go-offline

COPY backend/api/src ./src

RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar ./app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]