declare module 'react' {
  const React: any;
  export default React;
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
