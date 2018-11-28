import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';
import { discount } from './discount.model';

export class shotOrderItem {

  public orderid: String;

  public orderContent: String;

  public orderThumbUrl: String;

  public orderTime: String;

  public orderStatus: String;

  public orderAmount: String;
  
  public craftsman: String;

}



/**
 * Post Schema
 */
export class OrderItem extends Typegoose {
  @prop()
  public orderid: String;

  @prop()
  public contactsUserName: String;

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
  public gServiceItemid: String;

  @prop()
  public houseName: String;

  @prop()
  public orderDescription: String;

  @prop()
  public orderThumbUrl: String;

  @prop()
  public orderTime: String;

  @prop()
  public orderStatus: String;

  @prop()
  public orderAmount: String;

  @prop()
  public  preAmount: String;
  
  @prop()
  public craftsman: String;

  @prop()
  public projectid: String;

  @prop()
  public createdBy: String;


}

const OrderItemModel = new OrderItem().getModelForClass(OrderItem, {
  schemaOptions: {
    timestamps: true,
  }
});



export default OrderItemModel;
;


