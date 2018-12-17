import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

export class shotOrderItem {

  public orderid: String;

  public orderContent: String;

  public orderThumbUrl: String;

  public orderTime: String;

  public orderStatus: OrderStatus;

  public orderAmount: Number;

  public craftsman: String;

  public paymentStatus: OrderPaymentStatus;

}

export enum OrderStatus {
  Initializing = 1,
  Preparing = 2,
  InProgress = 3,
  Completed = 4,
  Canceled = 5,
}

export enum OrderPaymentStatus {
  Initializing = 1,
  Waiting = 2,
  Completed = 3,
  Closed = 4,
  Exception = 5,
}

/**
 * Post Schema
 */
export class OrderItem extends Typegoose {

  @prop({ unique: true })
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
  public orderStatus: OrderStatus;

  @prop()
  public orderAmount: Number;

  @prop()
  public preAmount: Number;

  @prop()
  public paidAmount: Number;

  @prop()
  public craftsman: String;

  @prop()
  public projectid: String;

  @prop({ default: OrderPaymentStatus.Waiting })
  public paymentStatus?: OrderPaymentStatus;

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


