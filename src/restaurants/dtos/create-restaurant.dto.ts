import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

/**
 * 데이터 INSERT 를 위한 DTO
 * OmitType 은 상속받은 엔티티에서 특정 필드를 제외할 때 사용
 * */
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field(() => Int, { nullable: true })
  restaurantId?: number;
}
