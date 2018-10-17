import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';


export class groupRule extends Typegoose {
    
    @prop()
    public groupRuleid:string;

    @prop()
    public groupRuleContent: string;
}

var groupRuleModel = new groupRule().getModelForClass(groupRule, {
    schemaOptions: {
      timestamps: true,
    }
  });

  export default groupRuleModel;
  