import React, { useEffect, useRef } from 'react';
import { RealmProvider } from '@realm/react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Navigations from './navigations';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Motorcycle } from './models/motorcycle';
import { Service } from './models/service';
import { Reminder } from './models/reminder';
import { setupNotificationChannel, scheduleWeeklyOdoReminder } from './utils/notifications';
import { globalStore } from './stores';

const App = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();

  useEffect(() => {
    // 1. Create channel for Android
    setupNotificationChannel();

    // 2. Schedule weekly checking if reminders are turned on globally
    const { isReminderEnabled } = globalStore.getState();
    if (isReminderEnabled) {
      scheduleWeeklyOdoReminder();
    }
  }, []);

  return (
    <>
      <RealmProvider
        schema={[Motorcycle, Service, Reminder]}
        schemaVersion={5}
        deleteRealmIfMigrationNeeded={false}
        // Jalankan migration kalau ada schema change
        onMigration={(oldRealm, newRealm) => {
          try {
            // v1 → v2: Motorcycle added updatedAt & image fields
            if (oldRealm.schemaVersion < 2) {
              const oldMotorcycles = oldRealm.objects('Motorcycle');
              const newMotorcycles = newRealm.objects('Motorcycle');
              for (let i = 0; i < oldMotorcycles.length; i++) {
                newMotorcycles[i].updatedAt = new Date();
                newMotorcycles[i].image = '';
              }
            }

            // v3 → v4: Service added items & receiptPhotos fields
            if (oldRealm.schemaVersion < 4) {
              const newServices = newRealm.objects('Service');
              for (let i = 0; i < newServices.length; i++) {
                if (!newServices[i].items) {
                  newServices[i].items = '[]';
                }
                // receiptPhotos (list type) is auto-initialized by Realm
              }
            }
          } catch (error) {
            console.error('[App] Migration failed:', error);
          }
        }}>
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
              }
            }}>
            <Navigations />
          </NavigationContainer>
        </SafeAreaProvider>
      </RealmProvider>
    </>
  );
};

export default App;
