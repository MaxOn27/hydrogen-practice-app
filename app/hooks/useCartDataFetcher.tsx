import {useMatches} from '@remix-run/react';
import {useState, useEffect} from 'react';

export function useCartDataFetcher() {
  const [root] = useMatches();
  const [cart, setCart] = useState<null | Record<string, any>>(null);

  useEffect(() => {
    root.data?.cart?.then(setCart).catch((error: any) => setCart(null));
  }, [root.data.cart, root.data.cartPromise, setCart]);

  return cart;
}
