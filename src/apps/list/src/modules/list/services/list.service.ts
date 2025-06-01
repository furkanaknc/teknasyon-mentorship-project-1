import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { createListPayload, updateListPayload } from '../../../validations/list.validation';
import { RedisService } from '../../common/redis/redis.service';
import { List, ListDocument } from '../schemas/list.schema';
import { ListItem, ListItemDocument } from '../schemas/list-item.schema';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private listModel: Model<ListDocument>,
    @InjectModel(ListItem.name) private listItemModel: Model<ListItemDocument>,
    private readonly redisService: RedisService,
  ) {}

  async findByIdOrThrow(id: string): Promise<List> {
    const cacheKey = `list:${id}`;
    const cachedList = await this.redisService.get<List>(cacheKey);
    if (cachedList) {
      return cachedList;
    }

    const list = await this.listModel.findById(id).exec();
    if (!list) {
      throw new NotFoundException('List not found');
    }

    await this.redisService.set(cacheKey, list, 300);
    return list;
  }

  async findListBySlug(slug: string): Promise<List> {
    const cacheKey = `list:slug:${slug}`;
    const cachedList = await this.redisService.get<List>(cacheKey);
    if (cachedList) {
      return cachedList;
    }

    const list = await this.listModel.findOne({ slug }).exec();
    if (!list) {
      throw new NotFoundException('List not found');
    }

    await this.redisService.set(cacheKey, list, 300);
    return list;
  }

  async createList(payload: createListPayload): Promise<List> {
    const createdList = await new this.listModel(payload).save();
    await this.redisService.del('all_lists');
    return createdList;
  }

  async updateList(id: string, payload: updateListPayload): Promise<List> {
    await this.findByIdOrThrow(id);

    const updatedList = await this.listModel.findByIdAndUpdate(id, payload, { new: true }).exec();
    if (!updatedList) {
      throw new NotFoundException(`List with id ${id} not found`);
    }

    await this.redisService.del(`list:${id}`);
    await this.redisService.del('all_lists');
    return updatedList;
  }

  async findAllLists(): Promise<List[]> {
    const cacheKey = 'all_lists';
    const cachedLists = await this.redisService.get<List[]>(cacheKey);
    if (cachedLists) {
      return cachedLists;
    }

    const lists = await this.listModel.find().exec();
    await this.redisService.set(cacheKey, lists, 300);
    return lists;
  }

  async removeList(id: string): Promise<List> {
    await this.findByIdOrThrow(id);

    await this.listItemModel.deleteMany({ list_id: new Types.ObjectId(id) });

    const removedList = await this.listModel.findByIdAndDelete(id).exec();
    if (!removedList) {
      throw new NotFoundException(`List with id ${id} not found`);
    }

    await this.redisService.del(`list:${id}`);
    await this.redisService.del('all_lists');
    return removedList;
  }
}
