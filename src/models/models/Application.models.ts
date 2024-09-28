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

export const orderScope = new ScopeStore({});

/** 外部应用 */
@Table<Application>({
  tableName: getTableName("application"),
  scopes: orderScope.mapOptions(),
})
export class Application extends Model<Application> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: () => nanoRandom()
  })
  id: string;

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
    type: DataType.INTEGER,
  })
  paymentId: number;

  
}

export default Application;
