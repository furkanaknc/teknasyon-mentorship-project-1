import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Types } from 'mongoose';

import { ListIdParam, ListItemsIdParam } from '../../validations/common/id.validation';
import { CreateListItemPayload, UpdateListItemPayload } from '../../validations/list-items.validation';
import { ListService } from './list.service';

@Controller('list-items')
export class ListItemController {
  constructor(private readonly listService: ListService) {}

  @Post('list/:listId')
  async createListItem(@Param('listId') listId: string, @Body() payload: CreateListItemPayload) {
    const listItemData = {
      ...payload,
      list_id: new Types.ObjectId(listId),
    };

    return this.listService.createListItem(listItemData);
  }

  @Get('list/:listId')
  async findAllListItems(@Param() { listId }: ListIdParam) {
    return this.listService.findAllListItems(listId);
  }

  @Get(':listItemId')
  async findOneListItem(@Param() { listItemId }: ListItemsIdParam) {
    return this.listService.findOneListItem(listItemId);
  }

  @Put(':listItemId')
  async updateListItem(@Param() { listItemId }: ListItemsIdParam, @Body() payload: UpdateListItemPayload) {
    return this.listService.updateListItem(listItemId, payload);
  }

  @Put(':listItemId/toggle')
  async toggleListItemCheck(@Param() { listItemId }: ListItemsIdParam) {
    return this.listService.toggleListItemCheck(listItemId);
  }

  @Delete(':listItemId')
  async removeListItem(@Param() { listItemId }: ListItemsIdParam) {
    return this.listService.removeListItem(listItemId);
  }
}
