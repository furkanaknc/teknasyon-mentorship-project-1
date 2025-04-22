import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserCreatePayload, UserUpdatePayload } from '../../validations/user.validation';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async create(payload: UserCreatePayload): Promise<User> {
    const createdUser = new this.userModel(payload);

    return createdUser.save();
  }

  async update(id: string, payload: UserUpdatePayload): Promise<User> {
    await this.findByIdOrThrow(id);

    return this.userModel.findByIdAndUpdate(id, payload, { new: true }).exec() as Promise<User>;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async remove(id: string): Promise<User> {
    await this.findByIdOrThrow(id);

    return this.userModel.findByIdAndDelete(id).exec() as Promise<User>;
  }
}
