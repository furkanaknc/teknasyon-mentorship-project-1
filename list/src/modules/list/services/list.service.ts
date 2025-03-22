import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { createListPayload, updateListPayload } from '../../../validations/list.validation';
import { List, ListDocument } from '../schemas/list.schema';
import { ListItem, ListItemDocument } from '../schemas/list-item.schema';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private listModel: Model<ListDocument>,
    @InjectModel(ListItem.name) private listItemModel: Model<ListItemDocument>,
  ) {}

  async findByIdOrThrow(id: string): Promise<List> {
    const list = await this.listModel.findById(id).exec();

    if (!list) throw new NotFoundException('List not found');

    return list;
  }

  async findListBySlug(slug: string): Promise<List> {
    const list = this.listModel.findOne({ slug }).exec();

    if (!list) throw new NotFoundException('List not found');

    return list as Promise<List>;
  }

  async createList(payload: createListPayload): Promise<List> {
    const createdList = new this.listModel(payload);

    return createdList.save();
  }

  async updateList(id: string, payload: updateListPayload): Promise<List> {
    await this.findByIdOrThrow(id);

    return this.listModel.findByIdAndUpdate(id, payload, { new: true }).exec() as Promise<List>;
  }

  async findAllLists(): Promise<List[]> {
    return this.listModel.find().exec();
  }

  async removeList(id: string): Promise<List> {
    await this.findByIdOrThrow(id);

    await this.listItemModel.deleteMany({ list_id: new Types.ObjectId(id) });

    return this.listModel.findByIdAndDelete(id).exec() as Promise<List>;
  }
}
