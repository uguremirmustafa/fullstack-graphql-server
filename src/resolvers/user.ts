import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2';

// InputType used for inputs
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

// ObjectType used for returning values
@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }
  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username must be longer than 2 charachters',
          },
        ],
      };
    }
    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'password must be longer than 3 charachters',
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }

    //store user id in the session
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse, { nullable: true })
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{ field: 'username', message: 'username doesnt exist' }],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{ field: 'password', message: 'invalid login' }],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }
}
