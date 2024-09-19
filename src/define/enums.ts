/** 频道类型 */
export enum SpaceType {}

/** jwt keyid */
export enum JwtKeyid {
  user = 'hpy_user',
  adminUser = 'hpy_adminUser',
}

/** 频道开放程度 */
export enum SpaceOpenType {
  PRIVATE = 0,
  FRIEND_CAN_JOIN = 1,
  EVERYONE_CAN_JOIN = 2,
  PUBLIC = 10,
}

/** 管理员类型 */
export enum AdminUserType {
  // 普通管理员
  NORMAL = 0,
  // 超级管理员
  SUPER = 1,
}

export enum AdminUserStatus {
  // 禁用
  DISABLED = -1,
  // 正常
  NORMAL = 0,
}

/** 空间关系 */
export enum SpaceRelationType {
  follow = 1,
  member = 2,
}

/** 动态关系 */
export enum PostRelationType {
  like = 1,
}

/** 动态版本 */
export enum PostVersion {
  v1 = 'v1',
}

/** 用户类型 */
export enum UserType {
  appUser = 'app',
  adminUser = 'admin',
}

/** 活动申请状态 */
export enum ActivityApplyStatus {
  // 失效
  EXPIRED = 'expired',
  // 申请中
  APPLYING = 'applying',
  // 已通过
  PASSED = 'passed',
  // 已拒绝
  REJECTED = 'rejected',
}

export enum TimelineType {
  // 动态
  POST = 'post',
  // 活动
  ACTIVITY = 'activity',
}

export enum Gender {
  // 男
  MALE = 1,
  // 女
  FEMALE = 2,
  // 未知
  UNKNOWN = 0,
}


export enum AuditState {
  init = 'init',
  pass = 'pass',
  reject = 'reject',
}