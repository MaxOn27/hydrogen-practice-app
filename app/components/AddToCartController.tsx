import React, {useMemo} from 'react';
import {useFetcher, useMatches} from '@remix-run/react';
import {CartAction} from '~/lib/type';
import {useCartDataFetcher} from '~/hooks/useCartDataFetcher';
import {flattenConnection} from '@shopify/hydrogen';
import {CartLine} from '@shopify/hydrogen/storefront-api-types';

export function AddToCartController(
  {
    line,
    analytics,
  }: {
    line: {
      merchandiseId: string;
      maxQuantity: number;
    };
    analytics?: unknown;
  }) {
  const [root] = useMatches();
  const selectedLocale = root?.data?.selectedLocale;
  const fetcher = useFetcher();
  const cart = useCartDataFetcher();

  const inCartLine = useMemo(() => {
    if (!cart) return null;

    const currentLines = cart?.lines
      ? (flattenConnection(cart.lines) as unknown as CartLine[])
      : ([] as CartLine[]);

    return currentLines.find(
      (cartLine) => cartLine?.merchandise.id === line.merchandiseId,
    );

  }, [cart, line]);

  const prevQuantity = Number(
    Math.max(0, (inCartLine?.quantity || 0) - 1).toFixed(0),
  );

  return (
    <div>
      <div className="inline-flex items-center border rounded">
        {inCartLine && (
          <fetcher.Form action="/cart" method="post">
            {inCartLine.quantity > 1 && (
              <>
                <input
                  type="hidden"
                  name="cartAction"
                  value={CartAction.UPDATE_CART}
                />
                <input
                  type="hidden"
                  name="lines"
                  value={JSON.stringify([
                    {id: inCartLine.id, quantity: prevQuantity},
                  ])}
                />
              </>
            )}
            {inCartLine.quantity === 1 && (
              <>
                <input
                  type="hidden"
                  name="cartAction"
                  value={CartAction.REMOVE_FROM_CART}
                />
                <input
                  type="hidden"
                  name="linesIds"
                  value={JSON.stringify([inCartLine.id])}
                />
              </>
            )}
            <button
              type="submit"
              aria-label="Decrease quantity"
              className="w-10 h-10 transition text-primary/50 hover:text-primary disabled:text-primary/10"
            >
              <span>&#8722;</span>
            </button>
          </fetcher.Form>
        )}
        {!inCartLine && (
          <button
            type={'button'}
            disabled={true}
            aria-label="Decrease quantity"
            className="w-10 h-10 transition text-primary/50 hover:text-primary disabled:text-primary/10"
          >
            <span>&#8722;</span>
          </button>
        )}
        <div className="px-2 text-center" data-test="item-quantity">
          {inCartLine?.quantity || 0}
        </div>
        <fetcher.Form action="/cart" method="post">
          <input type="hidden" name="cartAction" value={CartAction.ADD_TO_CART} />
          <input
            type="hidden"
            name="countryCode"
            value={selectedLocale.country}
          />
          <input
            type="hidden"
            name="lines"
            value={JSON.stringify([
              {
                merchandiseId: line.merchandiseId,
                quantity: 1,
              },
            ])}
          />
          <input
            type="hidden"
            name="analytics"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            className="w-10 h-10 transition text-primary/50 hover:text-primary"
            name="increase-quantity"
            aria-label="Increase quantity"
            disabled={line.maxQuantity <= (inCartLine?.quantity || 0)}
          >
            <span>&#43;</span>
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
