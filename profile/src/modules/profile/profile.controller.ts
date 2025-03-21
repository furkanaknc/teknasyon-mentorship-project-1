import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { ProfileService } from './profile.service';
import { User } from './schemas/user.schema';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: Partial<User>) {
    return this.profileService.create(createUserDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: Partial<User>) {
    return this.profileService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.profileService.remove(id);
  }
}
