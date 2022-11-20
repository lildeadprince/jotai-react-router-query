import crypto from 'node:crypto';
import { afterEach, describe, expect, test } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { useUrlParamsSync } from '../src/index.js';

const SyncStore = ({ children, atom, paramName, readValue, writeParam }) => {
  useUrlParamsSync(atom, paramName, readValue, writeParam);
  return <>{children}</>;
};

export const AtomValueDisplay = ({ atom }) => <div data-testid="atom-display">{useAtomValue(atom)}</div>;

export async function getAtomDisplayValue(renderResult) {
  return (await renderResult.findByTestId('atom-display')).innerText;
}

export const LocationDisplay = () => (
  <div data-testid="location-display">{useLocation().pathname + useLocation().search}</div>
);

export async function getLocationDisplayValue(renderResult) {
  return (await renderResult.findByTestId('location-display')).innerText;
}

const initialTestValue = 'initialTestValue';
const testValue = 'testValue';
const testParamName = 'testParamName';

const TestApp = ({ rootRouteElement }) => (
  <Routes>
    <Route index={true} element={rootRouteElement} />
  </Routes>
);

describe('reading param', async () => {
  afterEach((ctx) => ctx.renderResult?.unmount());
  const renderWithRouter = (initialAtomValue, pathname, expectedAtomValue, isUsingSync, readValue, writeValue) => {
    const testAtom = atom(initialTestValue);

    return render(
      isUsingSync ? (
        <MemoryRouter initialEntries={[pathname]}>
          <SyncStore atom={testAtom} paramName={testParamName} readValue={readValue} writeValue={writeValue}>
            <TestApp
              rootRouteElement={
                <>
                  <AtomValueDisplay atom={testAtom} />
                  <LocationDisplay />
                </>
              }
            />
          </SyncStore>
        </MemoryRouter>
      ) : (
        <MemoryRouter initialEntries={[pathname]}>
          <TestApp
            rootRouteElement={
              <>
                <AtomValueDisplay atom={testAtom} />
                <LocationDisplay />
              </>
            }
          />
        </MemoryRouter>
      ),
    );
  };

  describe('without sync', async () => {
    describe('without param', async () => {
      test('gets initial value', async (ctx) => {
        ctx.renderResult = renderWithRouter(initialTestValue, '/', initialTestValue, false);
        expect(await getAtomDisplayValue(ctx.renderResult)).toBe(initialTestValue);
      });
    });
    describe('with param', async () => {
      test('gets initial value', async (ctx) => {
        ctx.renderResult = renderWithRouter(
          initialTestValue,
          `/?${testParamName}=${testValue}`,
          initialTestValue,
          false,
        );
        expect(await getAtomDisplayValue(ctx.renderResult)).toBe(initialTestValue);
      });
    });
  });
  describe('with sync', async () => {
    describe('without param', async () => {
      test('gets empty value', async (ctx) => {
        ctx.renderResult = renderWithRouter(initialTestValue, '/', initialTestValue, true);
        expect(await getAtomDisplayValue(ctx.renderResult)).toBe('');
      });
    });
    describe('with param', async () => {
      test('gets test value', async (ctx) => {
        ctx.renderResult = renderWithRouter(
          initialTestValue,
          `/?${testParamName}=${testValue}`,
          initialTestValue,
          true,
        );
        expect(await getAtomDisplayValue(ctx.renderResult)).toBe(testValue);
      });
    });
  });
});

describe('writing param', async () => {
  afterEach((ctx) => {
    ctx.renderResult?.unmount();
  });
  describe('without serialization', async () => {
    test('updating param updates atom', async (ctx) => {
      let navigationTargetValue;
      const testAtom = atom(initialTestValue);

      const NavigationTrigger = () => {
        const navigate = useNavigate();
        return (
          <button onClick={() => navigate(`/?${testParamName}=${navigationTargetValue}`)} data-testid="navigate-btn">
            navigate
          </button>
        );
      };

      ctx.renderResult = render(
        <MemoryRouter initialEntries={['/']}>
          <SyncStore atom={testAtom} paramName={testParamName}>
            <TestApp
              rootRouteElement={
                <>
                  <NavigationTrigger />
                  <AtomValueDisplay atom={testAtom} />
                  <LocationDisplay />
                </>
              }
            />
          </SyncStore>
        </MemoryRouter>,
      );

      navigationTargetValue = crypto.randomUUID();
      fireEvent.click(await ctx.renderResult.findByTestId('navigate-btn'));
      expect(await getAtomDisplayValue(ctx.renderResult)).toBe(navigationTargetValue);
      expect(await getLocationDisplayValue(ctx.renderResult)).toBe(`/?testParamName=${navigationTargetValue}`);
    });

    test('updating atom updates param', async (ctx) => {
      let atomUpdateValue;
      const testAtom = atom(initialTestValue);

      const AtomUpdateTrigger = () => {
        const updateAtom = useSetAtom(testAtom);
        return (
          <button onClick={() => updateAtom(atomUpdateValue)} data-testid="update-atom-btn">
            navigate
          </button>
        );
      };

      ctx.renderResult = render(
        <MemoryRouter initialEntries={['/']}>
          <SyncStore atom={testAtom} paramName={testParamName}>
            <TestApp
              rootRouteElement={
                <>
                  <AtomUpdateTrigger />
                  <AtomValueDisplay atom={testAtom} />
                  <LocationDisplay />
                </>
              }
            />
          </SyncStore>
        </MemoryRouter>,
      );

      atomUpdateValue = crypto.randomUUID();
      fireEvent.click(await ctx.renderResult.findByTestId('update-atom-btn'));
      expect(await getAtomDisplayValue(ctx.renderResult)).toBe(atomUpdateValue);
    });
  });
  describe('with serialization', async () => {
    const readAtomValue = (stringOfOnesOrNull) => stringOfOnesOrNull?.length || 0;
    const writeParamValue = (amountOfOnes) => '1'.repeat(amountOfOnes);

    test('updating param updates atom', async (ctx) => {
      let navigationTargetValue;
      const testAtom = atom(initialTestValue);

      const NavigationTrigger = () => {
        const navigate = useNavigate();
        return (
          <button onClick={() => navigate(`/?${testParamName}=${navigationTargetValue}`)} data-testid="navigate-btn">
            navigate
          </button>
        );
      };

      ctx.renderResult = render(
        <MemoryRouter initialEntries={['/']}>
          <SyncStore atom={testAtom} paramName={testParamName} readValue={readAtomValue} writeParam={writeParamValue}>
            <TestApp
              rootRouteElement={
                <>
                  <NavigationTrigger />
                  <AtomValueDisplay atom={testAtom} />
                  <LocationDisplay />
                </>
              }
            />
          </SyncStore>
        </MemoryRouter>,
      );

      navigationTargetValue = '1'.repeat(16);
      fireEvent.click(await ctx.renderResult.findByTestId('navigate-btn'));
      expect(await getAtomDisplayValue(ctx.renderResult)).toBe('16');
      expect(await getLocationDisplayValue(ctx.renderResult)).toBe(`/?testParamName=${'1'.repeat(16)}`);
    });

    test('updating atom updates param', async (ctx) => {
      let atomUpdateValue;
      const testAtom = atom(initialTestValue);

      const AtomUpdateTrigger = () => {
        const updateAtom = useSetAtom(testAtom);
        return (
          <button onClick={() => updateAtom(atomUpdateValue)} data-testid="update-atom-btn">
            navigate
          </button>
        );
      };

      ctx.renderResult = render(
        <MemoryRouter initialEntries={['/']}>
          <SyncStore atom={testAtom} paramName={testParamName} readValue={readAtomValue} writeParam={writeParamValue}>
            <TestApp
              rootRouteElement={
                <>
                  <AtomUpdateTrigger />
                  <AtomValueDisplay atom={testAtom} />
                  <LocationDisplay />
                </>
              }
            />
          </SyncStore>
        </MemoryRouter>,
      );

      atomUpdateValue = 16;
      fireEvent.click(await ctx.renderResult.findByTestId('update-atom-btn'));
      expect(await getAtomDisplayValue(ctx.renderResult)).toBe('16');
      expect(await getLocationDisplayValue(ctx.renderResult)).toBe(`/?testParamName=${'1'.repeat(16)}`);
    });
  });
  describe('should limit amount of extra renders', async () => {
    test('updating param updates atom', async (ctx) => {
      let navigationTargetValue;
      const testAtom = atom(initialTestValue);
      const NavigationTrigger = () => {
        const navigate = useNavigate();
        return (
          <button onClick={() => navigate(`/?${testParamName}=${navigationTargetValue}`)} data-testid="navigate-btn">
            navigate
          </button>
        );
      };

      let renderCounterValue = 0;
      const RenderCounter = () => {
        renderCounterValue++;
        const atomValue = useAtomValue(testAtom);
        return <>{atomValue}</>;
      };

      ctx.renderResult = render(
        <MemoryRouter initialEntries={['/']}>
          <SyncStore atom={testAtom} paramName={testParamName}>
            <TestApp
              rootRouteElement={
                <>
                  <NavigationTrigger />
                  <RenderCounter />
                </>
              }
            />
          </SyncStore>
        </MemoryRouter>,
      );

      // +2 due to initial+effect read from URL
      expect(renderCounterValue).toBe(2);
      navigationTargetValue = '1231';
      fireEvent.click(await ctx.renderResult.findByTestId('navigate-btn'));

      // +1 due to read from URL after navigation
      expect(renderCounterValue).toBe(3);
    });

    test('updating atom updates param', async (ctx) => {
      let atomUpdateValue;
      const testAtom = atom(initialTestValue);

      const AtomUpdateTrigger = () => {
        const updateAtom = useSetAtom(testAtom);
        return (
          <button onClick={() => updateAtom(atomUpdateValue)} data-testid="update-atom-btn">
            navigate
          </button>
        );
      };

      let renderCounterValue = 0;
      const RenderCounter = () => {
        renderCounterValue++;
        const atomValue = useAtomValue(testAtom);
        return <>{atomValue}</>;
      };

      ctx.renderResult = render(
        <MemoryRouter initialEntries={['/']}>
          <SyncStore atom={testAtom} paramName={testParamName}>
            <TestApp
              rootRouteElement={
                <>
                  <AtomUpdateTrigger />
                  <RenderCounter />
                </>
              }
            />
          </SyncStore>
        </MemoryRouter>,
      );

      atomUpdateValue = 12312;

      // +2 due to initial + effect read from URL
      expect(renderCounterValue).toBe(2);
      fireEvent.click(await ctx.renderResult.findByTestId('update-atom-btn'));

      // +2 due to atom update + effect read from updated URL
      expect(renderCounterValue).toBe(4);
    });
  });
});
