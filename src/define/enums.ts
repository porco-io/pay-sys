/** jwt keyid */
export enum JwtKeyid {
  user = 'hpy_user',
}

export enum UserStatus {
  // 禁用
  DISABLED = -1,
  // 正常
  NORMAL = 0,
}

export enum AuditState {
  init = 'init',
  pass = 'pass',
  reject = 'reject',
}