import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


class rollItem {
    public rollItemid:string;
    public rollItemPicUrl: string;
    public rollItemLinkUrl: string;
}

/**
 * Post Schema
 */
export class projectRoll extends Typegoose {
    
    @prop()
    public projectid: String;
    
    @prop()
    public rollItemUrls?:  Array<rollItem>;

    @prop()
    public homePage?: Boolean;
  }
  
  var projectRollModel = new projectRoll().getModelForClass(projectRoll, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default projectRollModel;
  