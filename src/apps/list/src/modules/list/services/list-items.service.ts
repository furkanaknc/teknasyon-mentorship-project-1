import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateListItemPayload, UpdateListItemPayload } from '../../../validations/list-items.validation';
import { ListItem, ListItemDocument } from '../schemas/list-item.schema';

@Injectable()
export class ListItemsService {
  constructor(@InjectModel(ListItem.name) private listItemModel: Model<ListItemDocument>) {}

  async findByIdOrThrow(id: string): Promise<ListItem> {
    const listItem = await this.listItemModel.findById(id).exec();

    if (!listItem) throw new NotFoundException('List item not found');

    return listItem;
  }

  async createListItem(payload: CreateListItemPayload): Promise<ListItem> {
    const createdListItem = new this.listItemModel(payload);

    return createdListItem.save();
  }

  async updateListItem(id: string, payload: UpdateListItemPayload): Promise<ListItem> {
    await this.findByIdOrThrow(id);

    return this.listItemModel.findByIdAndUpdate(id, payload, { new: true }).exec() as Promise<ListItem>;
  }

  async findAllListItems(listId: string): Promise<ListItem[]> {
    return this.listItemModel.find({ list_id: new Types.ObjectId(listId) }).exec();
  }

  async removeListItem(id: string): Promise<ListItem> {
    await this.findByIdOrThrow(id);

    return this.listItemModel.findByIdAndDelete(id).exec() as Promise<ListItem>;
  }

  async toggleListItemCheck(id: string): Promise<ListItem> {
    const listItem = await this.findByIdOrThrow(id);

    return this.listItemModel
      .findByIdAndUpdate(id, { check: !listItem.check }, { new: true })
      .exec() as Promise<ListItem>;
  }
}
