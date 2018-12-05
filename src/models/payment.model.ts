import { prop, Typegoose, ModelType, InstanceType, pre, post } from 'typegoose';
import OrderItemModel, { OrderPaymentStatus } from './order.model';
import _ from 'lodash';

/**
 * Payment Schema
 *  appid, attach, bank_type, fee_type, is_subscribe,
    mch_id, nonce_str, openid,
    out_trade_no,
    result_code, return_code, sign, sub_mch_id, time_end,
    total_fee,
    coupon_fee_0,
    coupon_count,
    coupon_type,
    coupon_id,
    trade_type, transaction_id
 */
export type PaymentStatus = "待支付" | "已关闭" | "已支付" | "异常";
export const PaymentStatus = {
    Waiting: "待支付" as PaymentStatus,
    Closed: "已关闭" as PaymentStatus,
    Completed: "已支付" as PaymentStatus,
    Exception: "异常" as PaymentStatus,
};

@pre<Payment>("save", async function (next, doc?: InstanceType<Payment>) {
    // update orderItem paymentStatus field based on this payment's status.
    let orderItem = await OrderItemModel.findOne({ orderid: this.orderId });

    if (!orderItem || orderItem.paymentStatus == OrderPaymentStatus.Completed) {
        return;
    }

    if (this.status == PaymentStatus.Completed) {
        let existingPayments = await PaymentModel.find({ orderId: this.orderId, status: PaymentStatus.Completed });
        let paidFee = _(existingPayments).sumBy("totalFee");
        let orderAmount = (+orderItem.orderAmount * 100);
        if (orderAmount <= (paidFee + (+this.totalFee))) {
            // todo: 
            orderItem.paymentStatus = OrderPaymentStatus.Completed;
        }
        else {
            orderItem.paymentStatus = OrderPaymentStatus.Prepaid;
        }
    }
    else if (this.status == PaymentStatus.Waiting && !orderItem.paymentStatus) {
        orderItem.paymentStatus = OrderPaymentStatus.Waiting;
    }
    else if (this.status == PaymentStatus.Exception && (!orderItem.paymentStatus || orderItem.paymentStatus == OrderPaymentStatus.Waiting)) {
        orderItem.paymentStatus = OrderPaymentStatus.Exception;
    }
    else {
        // Not changed.
    }

    await orderItem.save();
})
export class Payment extends Typegoose {
    @prop()
    public orderId: String;
    @prop()
    public appId: String;
    @prop()
    public attach: String;
    @prop()
    public bankType: String;
    @prop()
    public feeType: String;
    @prop()
    public isSubscribe: String;
    @prop()
    public mchId: String;
    @prop()
    public nonceStr: String;
    @prop()
    public openId: String;
    @prop({ unique: true })
    public outTradeNo: String;
    @prop()
    public subMchId: String;
    @prop()
    public timeEnd: String;
    @prop()
    public totalFee: Number;
    @prop()
    public settlementTotalFee: Number;
    @prop()
    public cashFee: Number;
    @prop()
    public couponFee: String;
    @prop()
    public couponCount: String;
    @prop()
    public couponType: String;
    @prop()
    public couponId: String;
    @prop()
    public tradeType: String;
    @prop()
    public transactionId: String;
    @prop()
    public errCode: String;
    @prop()
    public errCodeDes: String;
    @prop({ default: PaymentStatus.Waiting })
    public status: PaymentStatus;
}

const PaymentModel = new Payment().getModelForClass(Payment, {
    schemaOptions: {
        timestamps: true,
    }
});

export default PaymentModel;