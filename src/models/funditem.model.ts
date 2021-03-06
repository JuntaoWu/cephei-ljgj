import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

export enum FundStatus {
    Initializing = 1,
    Waiting = 2,
    Completed = 3,
    Closed = 4,
    Exception = 5
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