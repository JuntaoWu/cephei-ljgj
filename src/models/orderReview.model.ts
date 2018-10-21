import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


/**
 * Post Schema
 */
export class OrderReivew extends Typegoose {
    @prop()
    public reviewid: String;

    @prop()
    public orderid: String;
  
    @prop()
    public serviceStars: Int32;

    @prop()
    public workStars: Int32;

    @prop()
    public orderDes: String;
  }
  
  var OrderReivewModel = new OrderReivew().getModelForClass(OrderReivew, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default OrderReivewModel;
  