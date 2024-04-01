class StorePropChangeEvent<T> extends Event {
  constructor(public oldValue: T, public newValue: T) {
    super('value', { bubbles: true, cancelable: true, composed: true });
  }
}

class BaseStoreProp<T> extends EventTarget {
  private _value: T;

  constructor(value: T) {
    super();
    this._value = value;
  }

  get value() {
    return this._value;
  }

  set value(value: T) {
    const prevValue = this._value;
    if (prevValue !== value) {
      this._value = value;
      this.dispatchEvent(new StorePropChangeEvent(prevValue, this._value));
    }
  }

  async *stream() {
    yield this.value;
    while (true) {
      yield new Promise(resolve => this.addEventListener('value', () => resolve(this.value), { once: true }));
    }
  }

  [Symbol.asyncIterator]() {
    return this.stream();
  }
}

/**
 * Takes POJO and converts the props to BaseStoreProp instance
 * @example
 * StoreProp<{ count: number, name: string }> => { count: BaseStoreProp<number>, name: BaseStoreProp<string> }
 */
type StoreProp<T> = {
  [K in keyof T]: BaseStoreProp<T[K]>;
};

/**
 * Takes POJO and converts the props to StoreProp instance
 * @example
 * ({ count: 1, name: 'world' }) => { count: BaseStoreProp(1), name: BaseStoreProp('world') }
 */
function instantiateStoreProps<T>(props: T): StoreProp<T> {
  const convertedValues = {} as StoreProp<T>;
  for (const key in props) {
    convertedValues[key] = new BaseStoreProp(props[key]);
  }
  return convertedValues;
}

type Store <T extends { [key: string]: any }> = {
  [K in keyof T]: BaseStoreProp<T[K]>;
} & BaseStoreProp<StoreProp<T>>;

type StoreConstructor = new <T extends { [key: string]: any }>(props: T) => Store<T>;

export const Store = class Store<T> extends BaseStoreProp<StoreProp<T>> {
  constructor(props: T) {
    super(instantiateStoreProps(props));
    for (const key in props) {
      Object.defineProperty(this, key, {
        get() {
          return this.value[key];
        },
        set(value: T[keyof T]) {
          this.value[key] = value;
        }
      });
    }
  }
} as StoreConstructor;

export const store = new Store({ count: 0, name: 'world', nested: { count: 1 } });
// @ts-ignore
window.store = store;


