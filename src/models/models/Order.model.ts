import { BelongsTo, BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript'
import { getTableName } from '../tool';
import { ApiProperty } from '@midwayjs/swagger';
import { ScopeStore, ScopeType } from '../scope';
import Payment from './Payment.model';
import { OrderProcessType, OrderState, RefundState } from '../../define/enums';

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
  contain_orderName: {
    type: ScopeType.contain,
    prop: 'orderName',
  },
  contain_goodsName: {
    type: ScopeType.contain,
    prop: 'goodsName',
  },
  eq_shopName: {
    type: ScopeType.contain,
    prop: 'shopName',
  },
  contain_bizNo: {
    type: ScopeType.contain,
    prop: 'bizNo',
  },
  eq_appKey: {
    type: ScopeType.eq,
    prop: 'appKey',
  },
  eq_bizNo: {
    type: ScopeType.eq,
    prop: 'bizNo',
  },
  eq_state: {
    type: ScopeType.eq,
    prop: 'state',
  },
  eq_refundState: {
    type: ScopeType.eq,
    prop: 'refundState',
  },
  eq_paymentId: {
    type: ScopeType.eq,
    prop: 'paymentId',
  },
  eq_paymentCode: {
    type: ScopeType.eq,
    prop: 'paymentCode',
  },
  eq_refundType: {
    type: ScopeType.eq,
    prop:'refundType',
  },
  eq_userId: {
    type: ScopeType.eq,
    prop: 'userId',
  },
  contain_userId: {
    type: ScopeType.contain,
    prop: 'userId',
  },
  between_amount: {
    type: ScopeType.between,
    prop: 'amount',
  },
  include_payment: {
    type: ScopeType.custom,
    scope: {
      include: [{
        model: Payment,
        as: 'payment',
        attributes: ['id', 'code', 'name', 'icon']
      }]
    }
  }
});

/** 订单 */
@Table<Order>({
  tableName: getTableName('order'),
  scopes: orderScope.mapOptions()
})
export class Order extends Model<Order> {
  /** appKey */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({ description: '所属应用'})
  appKey: string;

  /** 订单编号 `${应用id}_${luid}` */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({ description: '订单编号 `${应用id}_${luid}`'})
  orderSn: string;

  /** 订单业务类型, 根据流程类型，编排订单任务 */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({ description: '订单业务流程类型'})
  procType: OrderProcessType;

  /** 业务单号 */
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '业务单号'})
  bizNo?: string;

  /** 购买用户特征ID `${用户ID}` */
  @Column({
    type: DataType.STRING(20),
  })
  @ApiProperty({ description: '用户特征id'})
  userId?: string;

  /** 订单名称 */
  @Column({
    type: DataType.STRING(50),
  })
  @ApiProperty({ description: '订单名称'})
  orderName?: string;

  /** 商品名称 */
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '商品名称'})
  goodsName?: string;

  /** 业务名称 */
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '订单业务名称' })
  bizName?: string;
  
  /** 备注 */
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '备注'})
  note?: string;

  /** 店铺名称 */
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '店铺名称'})
  shopName?: string;

  /** 订单原价 单位分 */
  @Column({
    type: DataType.INTEGER,
  })
  @ApiProperty({ description: '订单原价 单位分'})
  originalAmount: number;

  /** 订单结算总价 单位分 */
  @Column({
    type: DataType.INTEGER,
  })
  @ApiProperty({ description: '订单结算总价 单位分'})
  amount: number;

  /** 订单优惠 单位分 */
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  @ApiProperty({ description: '订单优惠 单位分'})
  discount: number;

  /** 优惠券id */
  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    defaultValue: () => ([]),
  })
  @ApiProperty({ description: '优惠券id 单位分'})
  couponIds: number[];

  /** 订单状态 */
  @Column({
    type: DataType.STRING(10),
    defaultValue: OrderState.init,
  })
  @ApiProperty({ description: '订单状态', enum: OrderState })
  state: OrderState;

  /** 售后服务类型 1. 仅退款 2. 换货 3. 维修 4. 退货退款 */
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  @ApiProperty({ description: '售后服务类型 1. 仅退款 2. 换货 3. 维修 4. 退货退款 '})
  refundType: number;

  /** 售后单号 */
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '售后单号'})
  refundNo?: string;

  /** 售后退款金额 */
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  @ApiProperty({ description: '售后退款金额'})
  refundAmount: number;

  /** 支付代码 */
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '支付代码'})
  paymentCode: string;

  /** 支付方式 */
  @BelongsTo(() => Payment, {
    constraints: false,
    foreignKey: 'paymentCode',
    targetKey: 'code',
  })
  payment: Payment;

  /** 商品信息 */
  @Column({
    type: DataType.JSON,
    defaultValue: () => ({}),
  })
  @ApiProperty({ description: '商品信息'})
  goodsInfo: Record<string, any>;

  /** 订单取消原因 */
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '订单取消原因'})
  closeReason?: string;

  @Column({
    type: DataType.DATE
  })
  @ApiProperty({ description: '订单完成时间' })
  finishTime?: string;

  @Column({
    type: DataType.DATE
  })
  @ApiProperty({ description: '订单关闭时间' })
  closeTime?: string;

  @Column({
    type: DataType.DATE
  })
  @ApiProperty({ description: '订单支付时间' })
  payTime?: string;

  @Column({
    type: DataType.STRING
  })
  @ApiProperty({ description: '订单单号' })
  paySn?: string;

  @Column({
    type: DataType.STRING
  })
  @ApiProperty({ description: '发货hook地址' })
  shipHookUrl?: string;


  @Column({
    type: DataType.STRING
  })
  @ApiProperty({ description: '等待发货hook地址' })
  prepearShipHookUrl?: string;

  
}

export default Order;