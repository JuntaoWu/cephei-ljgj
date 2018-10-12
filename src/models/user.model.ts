import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { ObjectID, Int32 } from 'bson';
/**
 * User Schema
 */
export class User extends Typegoose {

  @prop()
  public phoneNo?: Int32;

  @prop()
  public uid?: String;

  @prop()
  public nickname?: String;
  
  @prop()
  public username?: String;

  @prop()
  public password?: String;

  @prop()
  public sex?: String;

  @prop()
  public headimgurl?: String;

}

const UserModel = new User().getModelForClass(User, {
  schemaOptions: {
    timestamps: true,
  }
});

export default UserModel;