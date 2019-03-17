import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

///特色项目

export class featureItem extends Typegoose {
    
    @prop()
    public featureItemid:string;
    
    @prop()
    public featureItemTitle:string;
    
    @prop()
    public featureItemDes:string;

    @prop()
    public featureItemThumbUrl:string;

    @prop()
    public featureItemLinkUrl:string;
}

var featureItemModel = new featureItem().getModelForClass(featureItem, {
    schemaOptions: {
      timestamps: true,
    }
  });

  export default featureItemModel;