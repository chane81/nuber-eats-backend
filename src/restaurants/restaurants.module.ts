import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryReolver, RestaurantResolver } from './restaurants.resolver';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { CategoryRepository } from './repositories/category.repository';
import { User } from 'src/users/entities/user.entity';

@Module({
  /** import repository */
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, User])],

  /** provider resolver, service */
  providers: [RestaurantResolver, RestaurantService, CategoryReolver],
})
export class RestaurantsModule {}
