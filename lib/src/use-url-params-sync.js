import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlParamsSync(
  atom,
  trackedParamName,
  readValue = defaultDeserializer,
  writeParam = defaultSerializer,
) {
  const [urlParams, setUrlParams] = useSearchParams();
  const [atomValue, setAtomValue] = useAtom(atom);

  const paramsEffectInitialized = useRef(false);

  const trackedParamValue = urlParams.get(trackedParamName);

  useEffect(() => {
    const newAtomValue = readValue(trackedParamValue);

    if (atomValue !== newAtomValue) {
      setAtomValue(newAtomValue);
    }
  }, [trackedParamValue]);

  useEffect(() => {
    if (paramsEffectInitialized.current) {
      const newParamValue = writeParam(atomValue);

      if (newParamValue !== trackedParamValue) {
        setUrlParams((prev) => {
          prev.set(trackedParamName, newParamValue);
          return prev;
        });
      }
    } else {
      paramsEffectInitialized.current = true;
    }
  }, [atomValue]);
}

function defaultDeserializer(paramValue) {
  return paramValue || '';
}

function defaultSerializer(paramValue) {
  return paramValue?.toString() || String(paramValue);
}
