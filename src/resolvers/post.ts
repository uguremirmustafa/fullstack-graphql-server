import { Post } from '../entities/Post';
import { MyContext } from 'src/types';
import { Resolver, Query, Ctx, Arg, Int, Mutation } from 'type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext) {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  //   @Args('id') -> bu id stringi graphql query cagirirken kullanacagimiz parametre ismi
  post(@Arg('id', () => Int) id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title', () => String) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    let post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number, @Ctx() { em }: MyContext): Promise<Boolean> {
    await em.nativeDelete(Post, { id });

    return true;
  }
}
