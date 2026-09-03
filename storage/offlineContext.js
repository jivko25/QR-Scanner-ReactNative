import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const OfflineContext = createContext({
  isConnected: true,
  isOffline: false,
  isInternetReachable: true,
});

export function OfflineProvider({ children }) {
  const [netState, setNetState] = useState({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetState({
        isConnected: state.isConnected !== false,
        isInternetReachable: state.isInternetReachable !== false,
      });
    });

    NetInfo.fetch().then((state) => {
      setNetState({
        isConnected: state.isConnected !== false,
        isInternetReachable: state.isInternetReachable !== false,
      });
    });

    return unsubscribe;
  }, []);

  const value = useMemo(() => {
    // isInternetReachable може да е null на някои устройства — тогава разчитаме на isConnected
    const offline =
      netState.isConnected === false ||
      netState.isInternetReachable === false;

    return {
      isConnected: !offline,
      isOffline: offline,
      isInternetReachable: netState.isInternetReachable,
    };
  }, [netState]);

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
