import '@midwayjs/core';

declare module '@midwayjs/core' {
  interface Context {
    state: {
      user?: import('../models/models/User.model').User,
      rawBody?: boolean,
    } & Record<string, any>
  }
}