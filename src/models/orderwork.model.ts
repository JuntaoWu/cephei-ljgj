import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


export class orderwork extends Typegoose {
    
    @prop()
    public orderWorkid:string;

    @prop()
    public orderWork:string;
    
    @prop()
    public orderid:string;

    @prop()
    public createTime:string;

    @prop()
    public workerid:string;
}

var orderWorkModel = new orderwork().getModelForClass(orderwork, {
    schemaOptions: {
      timestamps: true,
    }
  });

  export default orderWorkModel;