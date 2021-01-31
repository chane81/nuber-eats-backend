import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { Verification } from './entities/verification.entity';

@Module({
  /** import repository */
  imports: [TypeOrmModule.forFeature([User, Verification])],

  /** provider resolver, service */
  providers: [UsersResolver, UsersService],

  /** export service */
  exports: [UsersService],
})
export class UsersModule {}
