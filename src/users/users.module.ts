import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  /** import repository */
  imports: [TypeOrmModule.forFeature([User])],

  /** provider resolver, service */
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
