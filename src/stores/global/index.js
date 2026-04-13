import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const globalStore = create(
  persist(
    set => ({
      loading: false,
      setLoading: loading => {
        set({ loading });
      },

      errorServer: {},
      setErrorServer: errorServer => {
        set({ errorServer });
      },

      selectedMotorcycleId: null,
      setSelectedMotorcycleId: selectedMotorcycleId => {
        set({ selectedMotorcycleId });
      },

      // Reminder Settings
      isReminderEnabled: false,
      setIsReminderEnabled: isReminderEnabled => {
        set({ isReminderEnabled });
      },

      isDistanceReminderEnabled: false,
      setIsDistanceReminderEnabled: isDistanceReminderEnabled => {
        set({ isDistanceReminderEnabled });
      },

      distanceInterval: 2000,
      setDistanceInterval: distanceInterval => {
        set({ distanceInterval });
      },

      isTimeReminderEnabled: false,
      setIsTimeReminderEnabled: isTimeReminderEnabled => {
        set({ isTimeReminderEnabled });
      },

      timeInterval: 2, // Default 2 months
      setTimeInterval: timeInterval => {
        set({ timeInterval });
      },
    }),
    {
      name: 'global-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default globalStore;
