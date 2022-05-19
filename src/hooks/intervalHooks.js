import { useEffect, useRef } from 'react';

export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  //? callback이 변하지 않으면 useEffect 안써도 되지 않을까?
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };

    if (delay) {
      let id = setInterval(tick, delay);
      return () => {
        return clearInterval(id);
      };
    }
  }, [delay]);
};
