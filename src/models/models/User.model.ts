import { BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript'
import { getTableName } from '../tool';
import { ApiProperty } from '@midwayjs/swagger';
import { ScopeStore, ScopeType } from '../scope';

export const userScope = new ScopeStore({
  
});

@Table<User>({
  tableName: getTableName('user'),
  defaultScope: {
    attributes: {
      exclude: ['password', 'salt']
    },
  },
  scopes: userScope.mapOptions()
})
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  @ApiProperty()
  id: number

  @Column({
    type: DataType.STRING(15),
  })
  @ApiProperty({ name: '手机号'})
  phoneNumber: string

  @Column({
    type: DataType.STRING(15),
    allowNull: false
  })
  @ApiProperty({ name: '用户名'})
  username: string
}

export default User;