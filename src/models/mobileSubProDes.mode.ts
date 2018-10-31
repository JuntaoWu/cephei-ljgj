import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


export class mobileSubProDes extends Typegoose {
    
    @prop()
    public subProjectDesid:string;

    @prop()
    public subProjectDesContent: string;
}

var mobileSubProDesModel = new mobileSubProDes().getModelForClass(mobileSubProDes, {
    schemaOptions: {
      timestamps: true,
    }
  });

  export default mobileSubProDesModel;
  