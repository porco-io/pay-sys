import {
  Column,
  DataType,
  Model,
  Table,
} from "sequelize-typescript";
import { getTableName } from "../tool";
import { ApiProperty } from "@midwayjs/swagger";
import { ScopeStore, ScopeType } from "../scope";
import { nanoRandom } from "../../utils/cipher";

export const applicationScope = new ScopeStore({
  contains_name: {
    type: ScopeType.contain,
    field: "name",
  },
  exclude_secret: {
    type: ScopeType.custom,
    scope: {
      attributes: {
        exclude: ['secret']
      }
    }
  }
});

/** 应用 */
@Table<Application>({
  tableName: getTableName("application"),
  scopes: applicationScope.mapOptions(),
})
export class Application extends Model<Application> {
  /** 应用Key */
  @Column({
    type: DataType.STRING,
    unique: true,
    defaultValue: () => nanoRandom()
  })
  @ApiProperty({ description: '应用Key'})
  key: string;

  /** 秘钥 */
  @Column({
    type: DataType.STRING,
    defaultValue: () => nanoRandom(32)
  })
  @ApiProperty({ description: '应用秘钥'})
  secret: string;

  /** 名称 */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty({ description: '应用名称'})
  name: string;

  /** 应用描述 */
  @Column({
    type: DataType.STRING,
  })
  @ApiProperty({ description: '应用描述'})
  desc: string;

  /** 绑定支付方式 */
  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  @ApiProperty({ description: '支持的支付方式'})
  paymentCodes: string[];


  secure() {
    this.setDataValue('secret', '********')
    return this;
  }

  static findByKey(key: string) {
    return Application.findOne({
      where: { key },
    });
  }
}

export default Application;
