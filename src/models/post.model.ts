import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';

/**
 * Post Schema
 */
export class Post extends Typegoose {
  @prop()
  public title: String;
  @prop()
  public content: String;
}

const PostModel = new Post().getModelForClass(Post, {
  schemaOptions: {
    timestamps: true,
  }
});

export default PostModel;