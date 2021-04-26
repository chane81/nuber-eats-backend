import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AllowedRoles } from './role.decorator';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    // 만약 roles 가 없다면 public 권한
    if (!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;

    if (token) {
      const decoded = this.jwtService.verify(token.toString());

      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.userService.findById(decoded['id']);

        if (!user) {
          return false;
        }

        gqlContext['user'] = user;

        // Any role 의 경우는 user 가 있는지 여부만 체크
        if (roles.includes('Any')) {
          return true;
        }

        // 만약 user 가 있다면 role 를 체크
        return roles.includes(user.role);
      } else {
        return false;
      }
    } else {
      return false;
    }

    // const user: User = gqlContext['user'];

    // if (!user) {
    //   return false;
    // }

    // // Any role 의 경우는 user 가 있는지 여부만 체크
    // if (roles.includes('Any')) {
    //   return true;
    // }

    // 만약 user 가 있다면 role 를 체크
    // return roles.includes(user.role);
  }
}
