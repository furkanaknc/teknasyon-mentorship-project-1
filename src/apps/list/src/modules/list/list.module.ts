import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RedisModule } from '../common/redis/redis.module';
import { ListController } from './controllers/list.controller';
import { ListItemController } from './controllers/list-item.controller';
import { List, ListSchema } from './schemas/list.schema';
import { ListItem, ListItemSchema } from './schemas/list-item.schema';
import { ListService } from './services/list.service';
import { ListItemsService } from './services/list-items.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: List.name, schema: ListSchema },
      { name: ListItem.name, schema: ListItemSchema },
    ]),
    RedisModule,
  ],
  controllers: [ListController, ListItemController],
  providers: [ListService, ListItemsService],
  exports: [ListService],
})
export class ListModule {}
