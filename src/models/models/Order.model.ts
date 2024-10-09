import { BelongsTo, BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript'
import { getTableName } from '../tool';
import { ApiProperty } from '@midwayjs/swagger';
import { ScopeStore, ScopeType } from '../scope';
import Payment from './Payment.model';
import { OrderState } from '../../define/enums';

// orderSn     String       @id @unique @db.VarChar(50)
// // owner
// ownerId     String
// owner       User         @relation(fields: [ownerId], references: [uuid])
// // 订单名称
// orderTitle  String
// // 价格 单位分
// price       Int
// // 优惠
// discount    Int
// // 支付金额
// payAmount   Int
// // 商户用户id
// shoperId    String?
// // 订单分成
// orderShares OrderShare[]
// // 订单状态   0. 待付款 1. 待发货、2. 待付款、3. 已发货、4. 退款/售后 5. 已完成 -1. 已关闭
// orderState  Int          @default(0) @db.TinyInt
// // 订单类型   1. 活动报名 2. 购买推荐官资格
// orderType   Int          @db.TinyInt
// // 商品名称
// goodsName   String
// // 商品id, 当商品类型是活动报名时，此处是活动id
// goodsId     Int?
// // 商品信息
// goodsInfo   Json?
// // 支付时间
// payTime     DateTime?    @db.Timestamp(3)
// // 创建时间
// createdAt   DateTime     @default(now()) @db.Timestamp(3)
// // 更新时间
// updatedAt   DateTime?    @updatedAt @db.Timestamp(3)
// // 删除时间
// deletedAt   DateTime?    @db.Timestamp(3)
// // 退款单
// refund      Refund[]
// // 支付单
// payOrder    PayOrder[]

export const orderScope = new ScopeStore({
});

/** 订单 */
@Table<Order>({
  tableName: getTableName('order'),
  scopes: orderScope.mapOptions()
})
export class Order extends Model<Order> {

  /** appId */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  appKey: string;

  /** 订单编号 应用id+luid */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  orderSn: string;

  /** 业务单号 */
  @Column({
    type: DataType.STRING,
  })
  bizNo?: string;

  /** 购买用户特征ID */
  @Column({
    type: DataType.STRING,
  })
  userId?: string;

  /** 订单名称 */
  @Column({
    type: DataType.STRING,
  })
  orderName?: string;

  /** 商品名称 */
  @Column({
    type: DataType.STRING,
  })
  goodsName?: string;
  
  /** 备注 */
  @Column({
    type: DataType.STRING,
  })
  note?: string;

  /** 店铺名称 */
  @Column({
    type: DataType.STRING,
  })
  shopName?: string;

  /** 订单原价 单位分 */
  @Column({
    type: DataType.INTEGER,
  })
  originalAmount: number;

  /** 订单结算总价 单位分 */
  @Column({
    type: DataType.INTEGER,
  })
  amount: number;

  /** 订单优惠 单位分 */
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  discount: number;

  /** 优惠券id */
  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    defaultValue: () => ([]),
  })
  couponIds: number[];

  /** 订单状态 -1. 已关闭 0. 待付款 1. 待发货、2. 待收货 3. 退款/售后 9. 已完成 */
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  state: OrderState;

  /** 售后服务类型 1. 仅退款 2. 换货 3. 维修 4. 退货退款 */
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  refundType: number;

  /** 售后单号 */
  @Column({
    type: DataType.STRING,
  })
  refundNo?: string;

  /** 售后状态 0. 无售后 1. 待处理 2. 处理中 3. 已完成 */
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  refundState: number;

  /** 支付方式id */
  @Column({
    type: DataType.INTEGER,
  })
  paymentId: number;

  /** 支付方式 */
  @BelongsTo(() => Payment, {
    constraints: false,
    foreignKey: 'paymentId',
  })
  payment: Payment;

  /** 商品信息 */
  @Column({
    type: DataType.JSON,
    defaultValue: () => ({}),
  })
  goodsInfo: Record<string, any>;
}

export default Order;