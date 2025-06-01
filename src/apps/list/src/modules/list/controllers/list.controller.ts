import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { ListIdParam } from '../../../validations/common/id.validation';
import { createListPayload } from '../../../validations/list.validation';
import { List } from '../schemas/list.schema';
import { ListService } from '../services/list.service';

@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get()
  async findAllLists() {
    return await this.listService.findAllLists();
  }

  @Get(':listId')
  async findOneList(@Param() { listId }: ListIdParam) {
    return await this.listService.findByIdOrThrow(listId);
  }

  @Get('slug/:slug')
  async findListBySlug(@Param('slug') slug: string) {
    return await this.listService.findListBySlug(slug);
  }

  @Post()
  async createList(@Body() payload: createListPayload) {
    return await this.listService.createList(payload);
  }

  @Put(':listId')
  async updateList(@Param() { listId }: ListIdParam, @Body() updateListDto: Partial<List>) {
    return await this.listService.updateList(listId, updateListDto);
  }

  @Delete(':listId')
  async removeList(@Param() { listId }: ListIdParam) {
    return await this.listService.removeList(listId);
  }
}
