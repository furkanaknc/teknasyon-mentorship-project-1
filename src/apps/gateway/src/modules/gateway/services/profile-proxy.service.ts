import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '../../common/environment/environment.service';

@Injectable()
export class ProfileProxyService {
  constructor(
    private httpService: HttpService,
    private readonly environmentService: EnvironmentService,
  ) {}

  private get baseUrl(): string {
    return this.environmentService.get('PROFILE_SERVICE_URL');
  }

  async forwardRequest(method: string, path: string, data?: any, headers?: any) {
    try {
      const url = `${this.baseUrl}${path}`;
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data,
          headers,
        }),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
