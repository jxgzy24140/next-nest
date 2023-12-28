import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { CategoryModule } from './category/category.module';
import { RolesGuard } from './auth/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { SocketGateway } from './socket.gateway';
import { AuthService } from './auth/auth.service';
import { MediaModule } from './media/media.module';
// import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer';
// import { ConfigService } from 'aws-sdk';
// import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    UserModule,
    AuthModule,
    PostModule,
    CategoryModule,
    MediaModule,
    // MailerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (config: ConfigService) => ({
    //     transport: {
    //       host: config.get('MAIL_HOST'),
    //       secure: false,
    //       auth: {
    //         user: config.get('MAIL_USER'),
    //         pass: config.get('MAIL_PASSWORD'),
    //       },
    //       defaults: {
    //         from: `"No Reply" <${config.get('MAIL_FROM')}>`,
    //       },
    //       template: {
    //         dir: join(__dirname, 'src/templates/email'),
    //         adapter: new HandlebarsAdapter(),
    //         options: {
    //           strict: true,
    //         },
    //       },
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    SocketGateway,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
