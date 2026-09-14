import { useCallback, useEffect, useState } from 'react';

function useTimer() {
  const [timer, setTimer] = useState(60);
  const timeOutCallback = useCallback(
    () => setTimer((currentTime) => (currentTime > 0 ? currentTime - 1 : 0)),
    [],
  );
  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(timeOutCallback, 1000);
      return () => clearTimeout(id);
    }
  }, [timer, timeOutCallback]);

  const resetTimer = () => {
    if (timer === 0) {
      setTimer(60);
    }
  };

  return { timer, resetTimer };
}

export default useTimer;
