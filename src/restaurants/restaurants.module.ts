import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryReolver,
  DishResolver,
  RestaurantResolver,
} from './restaurants.resolver';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { CategoryRepository } from './repositories/category.repository';
import { User } from 'src/users/entities/user.entity';
import { Dish } from './entities/dish.entity';

@Module({
  /** import repository */
  imports: [
    TypeOrmModule.forFeature([Restaurant, Dish, CategoryRepository, User]),
  ],

  /** provider resolver, service */
  providers: [
    RestaurantResolver,
    RestaurantService,
    CategoryReolver,
    DishResolver,
  ],
})
export class RestaurantsModule {}
