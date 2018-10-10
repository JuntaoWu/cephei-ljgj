import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { ObjectID } from 'bson';
/**
 * User Schema
 */
export class User extends Typegoose {
  @prop()
  public username?: String;
  @prop()
  public password?: String;
}

const UserModel = new User().getModelForClass(User, {
  schemaOptions: {
    timestamps: true,
  }
});

export default UserModel;