import { BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript'
import { getTableName } from '../tool';
import { ApiProperty } from '@midwayjs/swagger';
import { ScopeStore, ScopeType } from '../scope';
import PayState, { PaymentPlatform } from '../../define/enums';
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
  /** 应用KEY */
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  appKey: string;

  /** 订单编号 */
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  orderSn: string;
  
  /** 支付单号 */
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  paySn: string;

  /** 支付代码 */
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  paymentCode: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false
  })
  platform: PaymentPlatform

  /** 支付状态 */
  @Column({
    type: DataType.STRING(10),
    defaultValue: PayState.paying,
  })
  state: PayState;

  /** 支付超时时间 */
  @Column({
    type: DataType.DATE
  })
  @ApiProperty({ description: '支付超时时间' })
  expireTime?: string;

  /** 支付单支付时间 */
  @Column({
    type: DataType.DATE
  })
  @ApiProperty({ description: '支付单支付时间' })
  payTime?: string;

  /** 支付金额 */
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })  
  @ApiProperty({ description: '支付金额 单位分' })
  amount: number;

  /** 支付标题 */
  @Column({
    type: DataType.STRING(40),
  })  
  @ApiProperty({ description: '支付标题' })
  title: string;

  /** 失败原因 */
  @Column({
    type: DataType.STRING,
  })  
  @ApiProperty({ description: '失败原因' })
  failReason?: string;
}

export default PayOrder;