import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

/**
 * Post Schema
 */
export class OrderContract extends Typegoose {
    @prop()
    public contractid: String;
  
    @prop()
    public orderid: String;
  
    @prop()
    public contractUrls?: Array<String>;
  }
  
  var OrderContractModel = new OrderContract().getModelForClass(OrderContract, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default OrderContractModel;
  