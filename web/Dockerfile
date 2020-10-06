FROM openjdk:8-alpine

COPY target/uberjar/complicated-timer.jar /complicated-timer/app.jar

EXPOSE 3000

CMD ["java", "-jar", "/complicated-timer/app.jar"]
