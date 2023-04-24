import { Body, Controller, Post } from '@nestjs/common'
 import * as uuid from 'uuid-random'                   // 使用uuid生成订单号
 import { CreateOrderDTO } from '../order/order.dto'   // 新增订单字段定义
 import { SeckillService } from './seckill.service'   // 秒杀逻辑具体实现
 import { awaitWrap } from '@/utils/index'            // async返回值简化方法

@Controller('seckill')
 export class SeckillController {
  constructor(private readonly seckillService: SeckillService) {}

   @Post('/add')
   async addOrder(@Body() order: CreateOrderDTO) {
     const params: CreateOrderDTO = {
       ...order,
       openid: `${uuid()}-${new Date().valueOf()}`,
     }

     // 调用service的secKill方法，并等待完成
     const [error, result] = await awaitWrap(this.seckillService.secKill(params))
     return error || result
   }
 }