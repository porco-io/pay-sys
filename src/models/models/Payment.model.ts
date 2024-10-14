import { BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript'
import { getTableName } from '../tool';
import { ApiProperty } from '@midwayjs/swagger';
import { ScopeStore, ScopeType } from '../scope';
import { nanoRandom } from '../../utils/cipher';
import { PaymentPlatform } from '../../define/enums';

export const paymentScope = new ScopeStore({
  eq_name: {
    type: ScopeType.eq,
    prop: 'name'
  },
  in_appKeys: {
    type: ScopeType.arrayContains,
    prop: 'appKeys'
  },
  eq_platform: {
    type: ScopeType.eq,
    prop: 'platform'
  },
  eq_code: {
    type: ScopeType.eq,
    prop: 'code'
  },
  in_codes: {
    type: ScopeType.in,
    prop: 'code'
  },
  order: {
    type: ScopeType.order,
  }
});

// 支付方式
@Table<Payment>({
  tableName: getTableName('payment'),
  scopes: paymentScope.mapOptions()
})
export class Payment extends Model<Payment> {

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: () => ([])
  })
  @ApiProperty({ description: '允许使用该支付的appKey列表'})
  appKeys: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({ description: '名称'})
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => nanoRandom(8)
  })
  @ApiProperty({ description: '支付代号'})
  code: string;

  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '图标'})
  icon: string;

  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '描述'})
  desc: string;
   
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '平台'})
  platform: PaymentPlatform;

  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '支付平台账号'})
  account: string;

  @Column({
    type: DataType.JSON,
    defaultValue: () => ({})
  })
  @ApiProperty({ description: '支付方式详情'})
  details: Record<string, any>;

  secured() {
    this.setDataValue('details', undefined)
    return this;
  }
}

export default Payment;