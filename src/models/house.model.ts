import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

class groupServicesItem {
    public gServiceItemid:string;
    public gServiceItemName: string;
}

/**
 * Post Schema
 */
export class groupHouseItem extends Typegoose {
    
    @prop()
    public houseid:string;

    @prop()
    public houseName: string;

    @prop()
    public houseAdress: string;

    @prop()
    public houseThumbUrl:string;

    @prop()
    public userJoinCount:Int32;

    @prop()
    public groupServiceList:Array<groupServicesItem>;
    
  }
  
  var groupHouseItemModel = new groupHouseItem().getModelForClass(groupHouseItem, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default groupHouseItemModel;
  