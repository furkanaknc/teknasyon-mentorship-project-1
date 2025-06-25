import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Req, Res } from '@nestjs/common';
import { Public } from '@teknasyon/shared-auth';
import { Request, Response } from 'express';

import { ProxyService } from '../app/proxy.service';

@Controller('list')
export class ListController {
  private readonly logger = new Logger(ListController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @Get('lists')
  async getAllLists(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('list', 'GET', '/lists', null, req, res);
  }

  @Public()
  @Get('lists/:listId')
  async getListById(@Param('listId') listId: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('list', 'GET', `/lists/${listId}`, null, req, res);
  }

  @Public()
  @Get('lists/slug/:slug')
  async getListBySlug(@Param('slug') slug: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('list', 'GET', `/lists/slug/${slug}`, null, req, res);
  }

  @Post('lists')
  async createList(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('list', 'POST', '/lists', body, req, res);
  }

  @Put('lists/:listId')
  async updateList(@Param('listId') listId: string, @Body() body: any, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('list', 'PUT', `/lists/${listId}`, body, req, res);
  }

  @Delete('lists/:listId')
  async deleteList(@Param('listId') listId: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('list', 'DELETE', `/lists/${listId}`, null, req, res);
  }

  @Public()
  @Get('health')
  async health(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('list', 'GET', '/health', null, req, res);
  }
}
