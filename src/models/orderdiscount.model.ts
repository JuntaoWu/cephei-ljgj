import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

/*
export class discountitem {
    public discountid:string;
    public discountTitle:string;
}
*/

export class orderdiscount extends Typegoose {
    
    @prop()
    public orderDiscountid:string;
    
    @prop()
    public orderid:string;

    @prop()
    public discountid:string;

    @prop()
    public discountTitle:string;

    @prop()
    public discountCount:string;
    

}

var orderDiscountModel = new orderdiscount().getModelForClass(orderdiscount, {
    schemaOptions: {
      timestamps: true,
    }
  });

  export default orderDiscountModel;
  