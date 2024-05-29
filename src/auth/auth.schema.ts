import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  userName: string;

  @Prop()
  profilePic: string;

  @Prop({ required: true })
  password: string;
  _id: any;
}
export const userSchema = SchemaFactory.createForClass(User);
