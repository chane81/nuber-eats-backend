import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as Joi from 'joi';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { AuthModule } from './auth/auth.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

@Module({
  imports: [
    // process env set
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIATE_KEY: Joi.string().required(),
        NODEMAILER_USER: Joi.string().required(),
        NODEMAILER_PASSWORD: Joi.string().required(),
        NODEMAILER_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    // type orm set
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: process.env.NODE_ENV === 'dev',
      // Heroku Postgres DB 연결시
      // ssl: {
      //   rejectUnauthorized: true,
      // },
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
      ],
    }),
    // graphql set
    GraphQLModule.forRoot({
      /** graphql schema 파일을 생성시에 아래 옵션 사용 */
      // autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql')
      autoSchemaFile: true,
      // gql context 에 user set
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'x-jwt';

        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        };
      },
      // subscription 설정
      installSubscriptionHandlers: true,
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIATE_KEY,
    }),
    MailModule.forRoot({
      smtpUser: process.env.NODEMAILER_USER,
      smtpPwd: process.env.NODEMAILER_PASSWORD,
      fromEmail: process.env.NODEMAILER_FROM_EMAIL,
    }),
    UsersModule,
    RestaurantsModule,
    AuthModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// subscription 기능사용으로 JwtMiddleware 사용부분 제거
// export class AppModule implements NestModule {
//   // 미들웨어 setup
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(JwtMiddleware).forRoutes({
//       path: '/graphql',
//       method: RequestMethod.ALL,
//     });
//   }
// }
