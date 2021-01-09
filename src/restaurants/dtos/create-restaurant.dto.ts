import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

/**
 * 데이터 INSERT 를 위한 DTO
 * OmitType 은 상속받은 엔티티에서 특정 필드를 제외할 때 사용
 * */
@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
