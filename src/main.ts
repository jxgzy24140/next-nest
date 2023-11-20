import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path'; //thêm này cho phần static file
import { NestExpressApplication } from '@nestjs/platform-express'; //thêm này cho phần static file
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); //thêm này cho phần static file
  const config = new DocumentBuilder()
    .setTitle('Blog APIs')
    .setDescription('List APIs for simple Blog by NXB Dev')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Users')
    .addBearerAuth()
    .build();
  const documnent = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documnent);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();
  app.useStaticAssets(join(__dirname, '../../uploads')); //thêm này cho phần static file
  await app.listen(8080);
}
bootstrap();
