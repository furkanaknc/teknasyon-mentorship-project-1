import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { UserIdPayload } from '../../validations/common/id.validation';
import { UserCreatePayload, UserUpdatePayload } from '../../validations/user.validation';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async findAll() {
    return await this.profileService.findAll();
  }

  @Get(':userId')
  async findOne(@Param() { userId }: UserIdPayload) {
    return await this.profileService.findByIdOrThrow(userId);
  }

  @Post()
  async create(@Body() payload: UserCreatePayload) {
    return await this.profileService.create(payload);
  }

  @Put(':userId')
  async update(@Param() { userId }: UserIdPayload, @Body() payload: UserUpdatePayload) {
    return await this.profileService.update(userId, payload);
  }

  @Delete(':userId')
  async remove(@Param() { userId }: UserIdPayload) {
    return await this.profileService.remove(userId);
  }
}
