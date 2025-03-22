import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ListItemDocument = HydratedDocument<ListItem>;

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
export class ListItem {
  @Prop({ type: Types.ObjectId, required: true, ref: 'List' })
  list_id: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  check: boolean;

  @Prop()
  interval?: number;
}

export const ListItemSchema = SchemaFactory.createForClass(ListItem);
