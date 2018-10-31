import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';

/**
 * Post Schema
 */
export class proCase extends Typegoose {
  @prop()
  public caseid: String;
  @prop()
  public hosueName: String;
  @prop()
  public projectName: String;
  @prop()
  public serviceTime: String;
  @prop()
  public caseThumbUrl: String;
  @prop()
  public orderid: String;
  @prop()
  public caseLinkUrl: String;
}

const ProCaseModel = new proCase().getModelForClass(proCase, {
  schemaOptions: {
    timestamps: true,
  }
});

export default ProCaseModel;