import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Req, Res } from '@nestjs/common';
import { Public } from '@teknasyon/shared-auth';
import { Request, Response } from 'express';

import { ProxyService } from '../app/proxy.service';

@Controller('list-items')
export class ListItemsController {
  private readonly logger = new Logger(ListItemsController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @Get(':listId')
  async getListItems(@Param('listId') listId: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('list', 'GET', `/lists/${listId}/items`, null, req, res);
  }

  @Get(':listId/:itemId')
  async getListItemById(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.proxyToService('list', 'GET', `/lists/${listId}/items/${itemId}`, null, req, res);
  }

  @Post(':listId')
  async createListItem(@Param('listId') listId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('list', 'POST', `/lists/${listId}/items`, body, req, res);
  }

  @Put(':listId/:itemId')
  async updateListItem(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.proxyToService('list', 'PUT', `/lists/${listId}/items/${itemId}`, body, req, res);
  }

  @Delete(':listId/:itemId')
  async deleteListItem(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.proxyToService('list', 'DELETE', `/lists/${listId}/items/${itemId}`, null, req, res);
  }
}
