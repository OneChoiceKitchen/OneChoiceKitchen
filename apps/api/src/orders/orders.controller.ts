import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('CUSTOMER', 'SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER')
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER', 'RIDER')
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Roles('CUSTOMER', 'SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER', 'RIDER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER', 'RIDER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
