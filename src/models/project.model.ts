import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Int32 } from 'bson';

/**
 * Post Schema
 */
export class ProjectItem extends Typegoose {
    @prop()
    public projectid: String;
    
    @prop()
    public projectName: String;
  
    @prop()
    public projectThumbUrl: String;

    @prop()
    public projectDes: String;
  }
  
  var ProjectItemModel = new ProjectItem().getModelForClass(ProjectItem, {
    schemaOptions: {
      timestamps: true,
    }
  });
  
  export default ProjectItemModel;
  