import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { IRequest, Public } from '@teknasyon/shared-auth';

import { ListIdParam } from '../../../validations/common/id.validation';
import { createListPayload } from '../../../validations/list.validation';
import { List } from '../schemas/list.schema';
import { ListService } from '../services/list.service';

@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  // Public route - anyone can view lists
  @Public()
  @Get()
  async findAllLists() {
    return await this.listService.findAllLists();
  }

  // Public route - anyone can view a specific list
  @Public()
  @Get(':listId')
  async findOneList(@Param() { listId }: ListIdParam) {
    return await this.listService.findByIdOrThrow(listId);
  }

  // Public route - anyone can view list by slug
  @Public()
  @Get('slug/:slug')
  async findListBySlug(@Param('slug') slug: string) {
    return await this.listService.findListBySlug(slug);
  }

  // Protected route - only authenticated users can create lists
  @Post()
  async createList(@Body() payload: createListPayload, @Req() request: IRequest) {
    // Now we have access to request.user.id from the JWT token
    const userId = request.user.id;
    return await this.listService.createList(payload, userId);
  }

  @Put(':listId')
  async updateList(@Param() { listId }: ListIdParam, @Body() updateListDto: Partial<List>, @Req() request: IRequest) {
    const userId = request.user.id;
    return await this.listService.updateList(listId, updateListDto, userId);
  }

  @Delete(':listId')
  async removeList(@Param() { listId }: ListIdParam, @Req() request: IRequest) {
    const userId = request.user.id;
    return await this.listService.removeList(listId, userId);
  }
}
