import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ListController } from './list.controller';
import { ListService } from './list.service';
import { ListItemController } from './list-item.controller';
import { List, ListSchema } from './schemas/list.schema';
import { ListItem, ListItemSchema } from './schemas/list-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: List.name, schema: ListSchema },
      { name: ListItem.name, schema: ListItemSchema },
    ]),
  ],
  controllers: [ListController, ListItemController],
  providers: [ListService],
  exports: [ListService],
})
export class ListModule {}
