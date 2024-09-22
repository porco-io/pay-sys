import crypto from 'crypto';
import { v4 } from 'uuid';

export const generatePassword = (password: string, salt: string) => {
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return hash;
};

export const validatePassword = (
  password: string,
  salt: string,
  storePwd: String
) => {
  return generatePassword(password, salt) === storePwd;
};

export const generateUserAuthToken = () => {
  return v4();
};

export const generateApplicationId = () => {
  const hash = crypto
    .createHash('md5')
    .update(Date.now() + crypto.randomBytes(6).toString())
    .digest('hex');
  return hash;
};

export const generateApplicationToken = () => {
  return v4();
};
export type TreeNode<T> = T &{
  children?: TreeNode<T>[];
}

export const buildTreeList = <T = Record<string, any>>(
  data: T[],
  idKey: keyof T,
  pidKey: keyof T,
  initialPid: string = null
): TreeNode<T>[] => {
  const map: Record<string, TreeNode<T>> = {};

  data.forEach((item) => {
    map[item[idKey] as string] = { ...item };
  });

  const treeList: TreeNode<T>[] = [];

  data.forEach((item) => {
    const parentId = item[pidKey] as string;
    if (parentId === initialPid) {
      treeList.push(map[item[idKey] as string]);
    } else if (parentId && map[parentId]) {
      const parent = map[parentId];
      const node = map[item[idKey] as string];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    }
  });

  const buildTree = (node: TreeNode<T>) => {
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        buildTree(child);
      });
    }
  };

  treeList.forEach((node) => {
    buildTree(node);
  });

  return treeList;
};

export function getEnumValues(enumObj: Record<string, string | number>) {
  const keys = Object.keys(enumObj).filter(e => e.length > 0 && isNaN(Number(e)));
  return keys.map(k => enumObj[k]);
}

export function genSalt() {
  return v4()
}