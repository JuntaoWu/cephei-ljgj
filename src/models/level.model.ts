import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { ObjectID } from 'bson';

class GameObjectInfo {
    public width: number;
    public height: number;
    public x: number;
    public y: number;
    public bodyType: number;
    public angle: number;
}

/**
 * Level Schema
 */
export class Level extends Typegoose {
  @prop()
  public balls?: Array<GameObjectInfo>;
  @prop()
  public walls?: Array<GameObjectInfo>;
  @prop()
  public holes?: Array<GameObjectInfo>;
  @prop()
  public createdBy?: String;
}

const LevelModel = new Level().getModelForClass(Level, {
  schemaOptions: {
    timestamps: true,
  }
});

export default LevelModel;