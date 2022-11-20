import { PrimitiveAtom } from 'jotai';

export function useUrlParamsSync<Value>(
  atom: PrimitiveAtom<Value>,
  paramName: string,
  readValue?: (paramValue: ReturnType<URLSearchParams['get']>) => Value,
  writeParam?: (atomValue: Value) => string,
);
