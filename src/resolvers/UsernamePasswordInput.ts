import { InputType, Field } from 'type-graphql';

// InputType used for inputs

@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
