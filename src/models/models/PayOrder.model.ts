import { BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript'
import { getTableName } from '../tool';
import { ApiProperty } from '@midwayjs/swagger';
import { ScopeStore, ScopeType } from '../scope';
// paySn      String    @id @unique @db.VarChar(50)
// // 退款状态 0.待支付 1. 支付成功  2.支付失败
// payState   Int       @default(0) @db.TinyInt
// // 支付失败原因
// failReason String?
// // 支付渠道 wx, alibaba, other
// source     String
// // 关联订单
// orderSn    String
// order      Order     @relation(fields: [orderSn], references: [orderSn])
// // 微信支付单
// wxPaySn    String?
// // 支付金额
// payAmount  Int
// // 关联用户
// ownerId    String
// owner      User      @relation(fields: [ownerId], references: [uuid])
// // 过期时间 
// expireTime DateTime? @db.Timestamp(3)
// // 支付时间
// payTime    DateTime? @db.Timestamp(3)
// // 创建时间
// createdAt  DateTime  @default(now()) @db.Timestamp(3)
// // 更新时间
// updatedAt  DateTime? @updatedAt @db.Timestamp(3)
// // 删除时间
// deletedAt  DateTime? @db.Timestamp(3)
export const payOrderScope = new ScopeStore({
  
});

/** 支付单 */
@Table<PayOrder>({
  tableName: getTableName('pay_order'),
  scopes: payOrderScope.mapOptions()
})
export class PayOrder extends Model<PayOrder> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
  })
  orderId: number;
  

}

export default PayOrder;