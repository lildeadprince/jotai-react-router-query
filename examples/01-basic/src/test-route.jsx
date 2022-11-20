import React, { useCallback, useRef } from 'react';
import { atom, useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUrlParamsSync } from 'jotai-react-router-query';

const pageOffsetAtom = atom(0);
const paramName = 'pageOffset';

export const TestRoute = () => {
  const rendersCount = useRef(0);
  useUrlParamsSync(pageOffsetAtom, paramName, (p) => Math.max(0, Number(p) || 0));

  return (
    <div>
      <p>
        <div>Current page: {useAtomValue(pageOffsetAtom)}</div>
        <div>Current location: {window.location.pathname + window.location.search}</div>
        <div>Total re-renders: {++rendersCount.current}</div>
      </p>
      <p>
        <NextPageButton />
      </p>
      <p>
        <div>
          <NavigateRandomPageButton />
        </div>
        <div>
          <SetPageParamForm />
        </div>
      </p>
      <div>
        <RefreshPageBtn />
      </div>
    </div>
  );
};

function NextPageButton() {
  const goToNextPage = useAtomCallback(
    useCallback((get, set) => {
      set(pageOffsetAtom, (prev) => prev + 1);
    }, []),
  );

  return <button onClick={goToNextPage}>Next page</button>;
}

function NavigateRandomPageButton() {
  const navigate = useNavigate();
  const navigateToRandomPage = useCallback(() => {
    navigate({
      pathname: '/',
      search: new URLSearchParams({
        [paramName]: Math.floor(Math.random() * 1000),
      }).toString(),
    });
  }, [navigate]);

  return <button onClick={navigateToRandomPage}>Navigate to random page</button>;
}

function SetPageParamForm() {
  const inputRef = useRef(null);
  const [, setUrlParams] = useSearchParams();
  const navigateToPage = useCallback(() => {
    const value = inputRef?.current?.value?.trim();
    if (/\d+/.test(value)) {
      setUrlParams((prev) => {
        prev.set(paramName, value);
        return prev;
      });
    }
  }, [setUrlParams]);

  return (
    <>
      <input ref={inputRef} placeholder={'Enter page number'} />
      <button onClick={navigateToPage}>Navigate to page</button>
    </>
  );
}

function RefreshPageBtn() {
  return <button onClick={() => window.location.reload()}>Refresh page with same URL params</button>;
}
