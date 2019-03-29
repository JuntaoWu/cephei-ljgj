import { prop, Typegoose, ModelType, InstanceType, pre, post } from 'typegoose';
import OrderItemModel, { OrderPaymentStatus } from './order.model';
import _ from 'lodash';
import funditemModel, { FundStatus } from './funditem.model';

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
export enum PaymentStatus {
    Initializing = 1,
    Waiting = 2,
    Completed = 3,
    Closed = 4,
    Exception = 5,
}

@pre<Payment>("save", async function (next, doc?: InstanceType<Payment>) {
    // update orderItem paymentStatus field based on this payment's status.
    let orderItem = await OrderItemModel.findOne({ orderid: this.orderId });

    if (!orderItem || orderItem.paymentStatus == OrderPaymentStatus.Completed) {
        return;
    }

    if (this.status == PaymentStatus.Completed) {
        let existingPayments = await PaymentModel.find({ orderId: this.orderId, status: PaymentStatus.Completed });
        let paidFee = _(existingPayments).sumBy("totalFee");
        let orderAmount = Math.floor(+orderItem.orderAmount * 100);
        if (orderAmount <= (paidFee + (+this.totalFee))) {
            // todo: 
            orderItem.paymentStatus = OrderPaymentStatus.Completed;
        }

        orderItem.paidAmount = orderAmount - (paidFee + (+this.totalFee));

        existingPayments.filter(payment => payment && payment.fundItemId).forEach(payment => {
            funditemModel.update({ fundItemId: payment.fundItemId }, { $set: { fundItemStatus: FundStatus.Completed } });
        });
    }
    else if (this.status == PaymentStatus.Waiting && (!orderItem.paymentStatus || orderItem.paymentStatus != OrderPaymentStatus.Closed)) {
        orderItem.paymentStatus = OrderPaymentStatus.Waiting;
    }
    else if (this.status == PaymentStatus.Exception && (!orderItem.paymentStatus || orderItem.paymentStatus != OrderPaymentStatus.Closed)) {
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
    @prop()
    public fundItemId: String;
}

const PaymentModel = new Payment().getModelForClass(Payment, {
    schemaOptions: {
        timestamps: true,
    }
});

export default PaymentModel;