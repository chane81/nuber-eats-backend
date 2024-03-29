import { v4 as uuidv4 } from 'uuid';
import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Entity, Column, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  /** User 의 row 삭제시 verification row 도 삭제 되게 CASCADE 설정 */
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    // 대체: Math.random().toString(36).substring(2)
    this.code = uuidv4();
  }
}
