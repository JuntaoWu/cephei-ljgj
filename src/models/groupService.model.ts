import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


export class groupService extends Typegoose {
    
    @prop()
    public gServiceItemid:string;

    @prop()
    public gServiceItemName: string;
}

var groupServiceModel = new groupService().getModelForClass(groupService, {
    schemaOptions: {
      timestamps: true,
    }
  });

  export default groupServiceModel;
  