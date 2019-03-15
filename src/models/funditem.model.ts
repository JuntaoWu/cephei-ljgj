import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

export enum FundStatus {
    Closed = 0,
    Waiting = 1,
    Completed = 2
  }

export class funditem extends Typegoose {
    
    @prop()
    public fundItemId:string;

    @prop()
    public orderid:string;

    @prop()
    public fundItemType:Number;

    @prop()
    public fundItemTitle:string;
    
    @prop()
    public fundItemAmount:Number;

    @prop()
    public fundItemStatus:FundStatus;
}

var funditemModel = new funditem().getModelForClass(funditem, {
    schemaOptions: {
      timestamps: true,
    }
  });

  export default funditemModel;