import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


class rollItem {
    public rollitemid:string;
    public rollItemPicUrl: string;
    public rollItemLinkUrl: string;
}

/**
 * Post Schema
 */
export class projectRollItem extends Typegoose {
    
    @prop()
    public projectid: String;
    
    @prop()
    public rollItemUrls?:  Array<rollItem>; 
  }
  
  var projectRollItemModel = new projectRollItem().getModelForClass(projectRollItem, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default projectRollItemModel;
  