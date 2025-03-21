import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ListDocument = HydratedDocument<List>;

@Schema({ timestamps: true })
export class List {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  color?: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: [String], default: [] })
  edit_allowed_user: string[];
}

export const ListSchema = SchemaFactory.createForClass(List);
