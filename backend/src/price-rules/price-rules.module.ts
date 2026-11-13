import { Module } from '@nestjs/common';
import { RoutesModule } from '../routes/routes.module';
import { PriceRulesController } from './price-rules.controller';
import { PriceRulesService } from './price-rules.service';

@Module({ imports: [RoutesModule], controllers: [PriceRulesController], providers: [PriceRulesService] })
export class PriceRulesModule {}
