export class EnvUtil {
  static get isProd() {
    return process.env.NODE_ENV === 'production';
  }

  static get isTest() {
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'unittest';
  }

  static get isDev() {
    return process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development';
  }

  static get isLocal() {
    return process.env.NODE_ENV === 'local';
  }
}