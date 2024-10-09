import { BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript'
import { getTableName } from '../tool';
import { ApiProperty } from '@midwayjs/swagger';
import { ScopeStore, ScopeType } from '../scope';
import { UserStatus } from '../../define/enums';

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

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  @ApiProperty({ name: '密码'})
  password: string

  @Column({
    type: DataType.STRING(60),
    allowNull: false
  })
  @ApiProperty()
  salt: string

  @Column({
    type: DataType.INTEGER(),
    allowNull: false
  })
  @ApiProperty()
  status: UserStatus

  @Column({
    type: DataType.STRING(80),
  })
  @ApiProperty()
  avatar: string
}

export default User;