import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { createListPayload, updateListPayload } from '../../validations/list.validation';
import { CreateListItemPayload, UpdateListItemPayload } from '../../validations/list-items.validation';
import { List, ListDocument } from './schemas/list.schema';
import { ListItem, ListItemDocument } from './schemas/list-item.schema';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private listModel: Model<ListDocument>,
    @InjectModel(ListItem.name) private listItemModel: Model<ListItemDocument>,
  ) {}

  async findAllLists(): Promise<List[]> {
    return this.listModel.find().exec();
  }

  async findOneList(id: string): Promise<List | null> {
    return this.listModel.findById(id).exec();
  }

  async findListBySlug(slug: string): Promise<List | null> {
    return this.listModel.findOne({ slug }).exec();
  }

  async createList(payload: createListPayload): Promise<List> {
    const createdList = new this.listModel(payload);
    return createdList.save();
  }

  async updateList(id: string, payload: updateListPayload): Promise<List | null> {
    return this.listModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  async removeList(id: string): Promise<List | null> {
    await this.listItemModel.deleteMany({ list_id: new Types.ObjectId(id) });
    return this.listModel.findByIdAndDelete(id).exec();
  }

  async findAllListItems(listId: string): Promise<ListItem[]> {
    return this.listItemModel.find({ list_id: new Types.ObjectId(listId) }).exec();
  }

  async findOneListItem(id: string): Promise<ListItem | null> {
    return this.listItemModel.findById(id).exec();
  }

  async createListItem(payload: CreateListItemPayload): Promise<ListItem> {
    const createdListItem = new this.listItemModel(payload);
    return createdListItem.save();
  }

  async updateListItem(id: string, payload: UpdateListItemPayload): Promise<ListItem | null> {
    console.log('payload', payload);

    return this.listItemModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  async removeListItem(id: string): Promise<ListItem | null> {
    return this.listItemModel.findByIdAndDelete(id).exec();
  }

  async toggleListItemCheck(id: string): Promise<ListItem | null> {
    const listItem = await this.listItemModel.findById(id);
    if (!listItem) return null;

    listItem.check = !listItem.check;
    return listItem.save();
  }
}
