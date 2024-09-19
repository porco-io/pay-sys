
export const tablePrefix = 'hpy';

export const caches = {
  userToken: (token: string) => `hpy_userToken:${token}`,
}
