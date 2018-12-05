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

export type OrderStatus = "审核中" | "准备中" | "施工中" | "已完成" | "已取消";
export const OrderStatus = {
  Initializing: "审核中" as OrderStatus,
  Preparing: "准备中" as OrderStatus,
  InProgress: "施工中" as OrderStatus,
  Completed: "已完成" as OrderStatus,
  Canceled: "已取消" as OrderStatus
};

export type OrderPaymentStatus = "待支付" | "已预付款项" | "已支付" | "异常";
export const OrderPaymentStatus = {
  Waiting: "待支付" as OrderPaymentStatus,
  Prepaid: "已预付款项" as OrderPaymentStatus,
  Completed: "已支付" as OrderPaymentStatus,
  Exception: "异常" as OrderPaymentStatus,
};

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
  public orderAmount: String;

  @prop()
  public preAmount: String;

  @prop()
  public craftsman: String;

  @prop()
  public projectid: String;

  @prop()
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


