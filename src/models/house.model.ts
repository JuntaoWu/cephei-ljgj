import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

export class groupServicesItem {
    public gServiceItemid:string;
    public gServiceItemName: string;
}

/**
 * Post Schema
 */
export class groupHouse extends Typegoose {
    
    @prop()
    public groupid:string;

    @prop()
    public houseid:string;

    @prop()
    public houseName: string;

    @prop()
    public houseAddress: string;

    @prop()
    public houseThumbUrl:string;

    @prop()
    public userJoinCount:Int32;

    @prop()
    public groupServiceList:Array<groupServicesItem>;
    
  }
  
  var groupHouseItemModel = new groupHouse().getModelForClass(groupHouse, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default groupHouseItemModel;
  