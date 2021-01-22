import { CoreOutput } from '../../common/dtos/output.dto';
import { Field, ObjectType, InputType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
