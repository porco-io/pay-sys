import { isArray, isNil, isString, isUndefined, omitBy } from 'lodash';
import { FindOptions, ScopeOptions, Op, ModelScopeOptions } from 'sequelize';
import { Model } from 'sequelize-typescript';

export enum ScopeType {
  eq = 'eq',
  neq = 'neq',
  between = 'between',
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
  contains = 'contains',
  attrs = 'attrs',
  in = 'in',
  order = 'order',
  custom = 'custom',
  arrayContains = 'arrayContains',
}

type ScopeFindOption<T = any> = (value: T) => FindOptions<Model> | null;

type ScopeTypeHandlers = {
  [ScopeType.eq]: ScopeFindOption<string | number | null | boolean>;
  [ScopeType.neq]: ScopeFindOption<string | number | null>;
  [ScopeType.between]: ScopeFindOption<[string?, string?] | [number?, number?]>;
  [ScopeType.gt]: ScopeFindOption<number>;
  [ScopeType.gte]: ScopeFindOption<number>;
  [ScopeType.lt]: ScopeFindOption<number>;
  [ScopeType.lte]: ScopeFindOption<number>;
  [ScopeType.contains]: ScopeFindOption<string>;
  [ScopeType.arrayContains]: ScopeFindOption<string | number |  (string | number)[] | undefined>;
  [ScopeType.in]: ScopeFindOption<any[]>;
  [ScopeType.attrs]: ScopeFindOption<string[]>;
  [ScopeType.order]: ScopeFindOption<string[]| string>;
  [ScopeType.custom]: () => null;
};
// FindOptions<TAttributes> | ((...args: readonly any[]) => FindOptions<TAttributes>
const scopeHandlers: {
  [s in ScopeType]: (prop?: string) => ScopeTypeHandlers[s];
} = {
  [ScopeType.eq]: prop => value =>
    isUndefined(value)
      ? {}
      : {
          where: {
            [prop]: value,
          },
        },
  [ScopeType.neq]:
    prop =>
    (value?: string | number): FindOptions =>
      isUndefined(value)
        ? {}
        : {
            where: {
              [prop]: {
                [Op.ne]: value,
              },
            },
          },
  [ScopeType.between]: prop => value => {
    const [min, max] = value;
    if (isNil(min) && isNil(max)) {
      return {};
    }
    if (isNil(min) && !isNil(max)) {
      return {
        where: {
          [prop]: {
            [Op.lte]: max,
          },
        },
      };
    }
    if (!isNil(min) && isNil(max)) {
      return {
        where: {
          [prop]: {
            [Op.gte]: min,
          },
        },
      };
    }
    return {
      where: {
        [prop]: {
          [Op.between]: value,
        },
      },
    };
  },
  [ScopeType.gt]: prop => value => {
    if (isNil(value)) return {};
    return {
      where: {
        [prop]: {
          [Op.gt]: value,
        },
      },
    };
  },
  [ScopeType.gte]: prop => value => {
    if (isNil(value)) return {};
    return {
      where: {
        [prop]: {
          [Op.gte]: value,
        },
      },
    };
  },
  [ScopeType.lt]: prop => value => {
    if (isNil(value)) return {};
    return {
      where: {
        [prop]: {
          [Op.lt]: value,
        },
      },
    };
  },
  [ScopeType.lte]: prop => value => {
    if (isNil(value)) return {};
    return {
      where: {
        [prop]: {
          [Op.lte]: value,
        },
      },
    };
  },
  [ScopeType.contains]: prop => value => {
    if (isNil(value)) return {};
    return {
      where: {
        [prop]: {
          [Op.like]: `%${value}%`,
        },
      },
    };
  },
  [ScopeType.attrs]: () => value => {
    if (isNil(value)) return {};
    return {
      attributes: value,
    };
  },
  [ScopeType.in]: prop => value => {
    if (!isArray(value)) return {};
    return {
      where: {
        [prop]: {
          [Op.in]: value,
        },
      },
    };
  },
  [ScopeType.arrayContains]: prop => value => {
    if (isNil(value)) return {};
    if (!isArray(value)) {
      value = [value]
    };
    value = value.filter(e => !isNil(e));
    if (!value.length) return {};
    return {
      where: {
        [prop]: {
          [Op.contains]: value,
        },
      },
    };
  },
  [ScopeType.order]: () => value => {
    if (isString(value) && value.length > 0) {
      value = (value as string).trim();
      if (value.includes(',')) {
        value = value.split(',').map(v => v.trim());
      } else {
        value = [value];
      }
    }
    if (isArray(value)) {
      const orderList = (value as string[]).reduce<[string, 'DESC' | 'ASC'][]>((acc, cur) => {
        if (isNil(cur) || !isString(cur) || cur.length === 0) return acc;
        if (cur.startsWith('-')) {
          acc.push([cur.slice(1), 'DESC'])
        } else {
          acc.push([cur, 'ASC'])
        }
        return acc;
      }, [])
      if (!orderList.length) {
        return {}
      }
      return {
        order: orderList
      }
    } else {
      return {};
    }
  },
  [ScopeType.custom]: () => null
} as const;


type ScopeDefine<T extends ScopeType = ScopeType> =  {
  type: T;
  prop?: string;
  scope?: FindOptions;
};

export class ScopeStore<M extends Record<string, ScopeDefine>> {
  map: M;

  constructor(scopeMap: M) {
    this.map = scopeMap;
  }

  /** 返回一个mathod配置 */
  method<S extends keyof M>(
    key: S,
    ...params: Parameters<ScopeTypeHandlers[M[S]['type']]>
  ): ScopeOptions | string {
    if (this.map[key].type === ScopeType.custom) {
      return key as string;
    }
    
    return {
      method: [key as string, ...params],
    };
  }

  getOption(key: keyof M) {
    const scopeOption = this.map[key];
    if (scopeOption.type === ScopeType.custom) {
      return scopeOption.scope;
    }
    const handlerOrScope = scopeHandlers[scopeOption.type];
    if (typeof handlerOrScope !== 'function') {
      return handlerOrScope;
    }
    const scopeFunc = handlerOrScope(scopeOption.prop);
    return scopeFunc;
  }

  mapOptions() {
    const options: Record<string, any> = {};
    Object.keys(this.map).reduce((state, key) => {
      state[key] = this.getOption(key);
      return state;
    }, options);
    return options;
  }
}
