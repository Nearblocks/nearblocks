const useStorage = (key: string, initialValue?: any) => {
  let storedValue: any;
  if (typeof window !== 'undefined') {
    try {
      const item = window.localStorage.getItem(key);
      storedValue = item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      storedValue = initialValue;
    }
  } else {
    storedValue = initialValue;
  }
  const setValue = (value: any) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      storedValue = valueToStore;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};
export default useStorage;
