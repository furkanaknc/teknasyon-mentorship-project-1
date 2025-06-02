import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { IRequest, Public } from '@teknasyon/shared-auth';

import { UserIdPayload } from '../../validations/common/id.validation';
import { UserCreatePayload, UserUpdatePayload } from '../../validations/user.validation';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Public()
  @Get()
  async findAll() {
    return await this.profileService.findAll();
  }

  @Public()
  @Get(':userId')
  async findOne(@Param() { userId }: UserIdPayload) {
    return await this.profileService.findByIdOrThrow(userId);
  }

  @Public()
  @Post()
  async create(@Body() payload: UserCreatePayload) {
    return await this.profileService.create(payload);
  }

  @Put()
  async update(@Body() payload: UserUpdatePayload, @Req() req: IRequest) {
    return await this.profileService.update(req.user.id, payload);
  }

  @Delete()
  async remove(@Req() req: IRequest) {
    return await this.profileService.remove(req.user.id);
  }
}
