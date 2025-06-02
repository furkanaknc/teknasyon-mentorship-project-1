import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { IRequest, Public } from '@teknasyon/shared-auth';

import { UserIdPayload } from '../../validations/common/id.validation';
import { UserCreatePayload, UserUpdatePayload } from '../../validations/user.validation';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // Public route - anyone can view all profiles (for demo purposes)
  @Public()
  @Get()
  async findAll() {
    return await this.profileService.findAll();
  }

  // Public route - anyone can view a specific profile
  @Public()
  @Get(':userId')
  async findOne(@Param() { userId }: UserIdPayload) {
    return await this.profileService.findByIdOrThrow(userId);
  }

  // Public route - anyone can create a profile (registration)
  @Public()
  @Post()
  async create(@Body() payload: UserCreatePayload) {
    return await this.profileService.create(payload);
  }

  // Protected route - users can update profiles (should validate ownership in real app)
  @Put()
  async update(@Body() payload: UserUpdatePayload, @Req() req: IRequest) {
    // In a real app, you'd validate that request.user.id === userId
    return await this.profileService.update(req.user.id, payload);
  }

  // Protected route - users can delete profiles (should validate ownership in real app)
  @Delete()
  async remove(@Req() req: IRequest) {
    // In a real app, you'd validate that request.user.id === userId
    return await this.profileService.remove(req.user.id);
  }
}
