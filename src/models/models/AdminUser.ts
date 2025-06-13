import { BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript'
import { getTableName } from '../tool';
import { ApiProperty } from '@midwayjs/swagger';
import { ScopeStore, ScopeType } from '../scope';
import { UserStatus } from '../../define/enums';
import { v4 } from 'uuid';
import { generatePassword } from '../../utils/helper';

export const userScope = new ScopeStore({
  
});

@Table<AdminUser>({
  tableName: getTableName('admin_user'),
  defaultScope: {
    attributes: {
      exclude: ['password', 'salt']
    },
  },
  scopes: userScope.mapOptions()
})
export class AdminUser extends Model<AdminUser> {

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

  static async initAdminUser() {
    const adminUser = await AdminUser.findOne({
      where: {
        username: process.env.ADMIN_USERNAME
      },
      attributes: ['id']
    })
    if (adminUser) return;
    const salt = v4();
    const password = generatePassword(process.env.ADMIN_PASSWORD, salt)
    await AdminUser.findOrCreate({
      where: {
        username: process.env.ADMIN_USERNAME
      },
      defaults: {
        salt,
        password,
        status: UserStatus.NORMAL,
      }
    })
  }
}

export default AdminUser;