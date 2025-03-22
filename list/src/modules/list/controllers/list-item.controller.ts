import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Types } from 'mongoose';

import { ListIdParam, ListItemsIdParam } from '../../../validations/common/id.validation';
import { CreateListItemPayload, UpdateListItemPayload } from '../../../validations/list-items.validation';
import { ListItemsService } from '../services/list-items.service';

@Controller('list-items')
export class ListItemController {
  constructor(private readonly listItemService: ListItemsService) {}

  @Post('list/:listId')
  async createListItem(@Param('listId') listId: string, @Body() payload: CreateListItemPayload) {
    const listItemData = {
      ...payload,
      list_id: new Types.ObjectId(listId),
    };

    return this.listItemService.createListItem(listItemData);
  }

  @Get('list/:listId')
  async findAllListItems(@Param() { listId }: ListIdParam) {
    return this.listItemService.findAllListItems(listId);
  }

  @Get(':listItemId')
  async findOneListItem(@Param() { listItemId }: ListItemsIdParam) {
    return this.listItemService.findByIdOrThrow(listItemId);
  }

  @Put(':listItemId')
  async updateListItem(@Param() { listItemId }: ListItemsIdParam, @Body() payload: UpdateListItemPayload) {
    return this.listItemService.updateListItem(listItemId, payload);
  }

  @Put(':listItemId/toggle')
  async toggleListItemCheck(@Param() { listItemId }: ListItemsIdParam) {
    return this.listItemService.toggleListItemCheck(listItemId);
  }

  @Delete(':listItemId')
  async removeListItem(@Param() { listItemId }: ListItemsIdParam) {
    return this.listItemService.removeListItem(listItemId);
  }
}
