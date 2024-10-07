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
    type: ScopeType.contains,
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

  @ApiProperty({ description: "应用ID" })
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  /** 应用Key */
  @Column({
    type: DataType.STRING,
    unique: true,
    defaultValue: () => nanoRandom()
  })
  key: string;

  /** 秘钥 */
  @Column({
    type: DataType.STRING,
    defaultValue: () => nanoRandom(32)
  })
  secret: string;

  /** 名称 */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  /** 应用描述 */
  @Column({
    type: DataType.STRING,
  })
  desc: string;

  /** 绑定支付方式 */
  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  paymentCodes: string[];


  secure() {
    this.setAttributes('secret', '******')
    return this;
  }
}

export default Application;
