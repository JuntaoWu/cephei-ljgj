import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

/**
 * Post Schema
 */
export class OrderItem extends Typegoose {
  @prop()
  public orderid: String;
  @prop()
  public token: String;

  @prop()
  public phoneNo: Int32;

  @prop()
  public isGroupOrder: boolean;

  @prop()
  public orderContent: String;

  @prop()
  public groupContent: String;

  @prop()
  public orderAddress: String;

  @prop()
  public houseName: String;

  @prop()
  public orderDescription: String;
}

const OrderItemModel = new OrderItem().getModelForClass(OrderItem, {
  schemaOptions: {
    timestamps: true,
  }
});



export default OrderItemModel;
;


