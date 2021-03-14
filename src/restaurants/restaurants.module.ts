import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantResolver } from './restaurants.resolver';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { Category } from './entities/category.entity';

@Module({
  /** import repository */
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],

  /** provider resolver, service */
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
