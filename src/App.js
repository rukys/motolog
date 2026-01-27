import React, { useEffect, useRef } from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Navigations from './navigations';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { globalStore, userStore } from './stores';

const App = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();

  return (
    <>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            routeNameRef.current = navigationRef.getCurrentRoute().name;
          }}
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.getCurrentRoute().name;

            const trackScreenView = () => {
              // Your implementation of analytics goes here!
            };

            if (previousRouteName !== currentRouteName) {
              // Save the current route name for later comparison
              routeNameRef.current = currentRouteName;

              // Replace the line below to add the tracker from a mobile analytics SDK
              await trackScreenView(currentRouteName);
              // console.log(currentRouteName);
            }
          }}>
          <Navigations />
        </NavigationContainer>
      </SafeAreaProvider>
    </>
  );
};

export default App;
