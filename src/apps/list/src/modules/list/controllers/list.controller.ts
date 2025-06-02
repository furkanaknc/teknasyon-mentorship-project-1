import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { IRequest, Public } from '@teknasyon/shared-auth';

import { ListIdParam } from '../../../validations/common/id.validation';
import { createListPayload } from '../../../validations/list.validation';
import { List } from '../schemas/list.schema';
import { ListService } from '../services/list.service';

@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Public()
  @Get()
  async findAllLists() {
    return await this.listService.findAllLists();
  }

  @Public()
  @Get(':listId')
  async findOneList(@Param() { listId }: ListIdParam) {
    return await this.listService.findByIdOrThrow(listId);
  }

  @Public()
  @Get('slug/:slug')
  async findListBySlug(@Param('slug') slug: string) {
    return await this.listService.findListBySlug(slug);
  }

  @Post()
  async createList(@Body() payload: createListPayload, @Req() req: IRequest) {
    return await this.listService.createList(payload, req.user.id);
  }

  @Put(':listId')
  async updateList(@Param() { listId }: ListIdParam, @Body() updateListDto: Partial<List>, @Req() req: IRequest) {
    return await this.listService.updateList(listId, updateListDto, req.user.id);
  }

  @Delete(':listId')
  async removeList(@Param() { listId }: ListIdParam, @Req() req: IRequest) {
    return await this.listService.removeList(listId, req.user.id);
  }
}
