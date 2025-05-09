import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      return ret;
    },
    virtuals: true,
  },
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop()
  avatar?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  token_hash_check?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
