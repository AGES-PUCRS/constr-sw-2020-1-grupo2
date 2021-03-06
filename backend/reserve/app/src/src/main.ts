import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('reserves');

  const options = new DocumentBuilder()
    .setTitle("API - Reserves")
    .setDescription("Construção de software - grupo 2 ")
    .setVersion("1.0")
    .addTag("Reserves")
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("reserves/api", app, document);

  await app.listen(3000);
}
bootstrap();
