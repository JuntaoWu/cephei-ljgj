import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


class serviceItem {
    public serviceid:string;
    public serviceName: string;
}

/**
 * Post Schema
 */
export class SubProject extends Typegoose {
    
    @prop()
    public projectid: String;
  
    @prop()
    public subServiceItemList?:  Array<serviceItem>;
  }
  
  var subProjectModel = new SubProject().getModelForClass(SubProject, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default subProjectModel;
  