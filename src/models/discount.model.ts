import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


export class discount extends Typegoose {
    
    @prop()
    public discountid:string;

    @prop()
    public discountTitle:string;
    
}

var discountModel = new discount().getModelForClass(discount, {
    schemaOptions: {
      timestamps: true,
    }
  });

  export default discountModel;