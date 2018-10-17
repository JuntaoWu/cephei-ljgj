import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


class serviceItem {
    public serviceid:string;
    public serviceName: string;
}

/**
 * Post Schema
 */
export class subProjectItem extends Typegoose {
    
    @prop()
    public projectid: String;
  
    @prop()
    public subServiceItemList?:  Array<serviceItem>;
  }
  
  var subProjectItemModel = new subProjectItem().getModelForClass(subProjectItem, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default subProjectItemModel;
  