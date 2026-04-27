import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GlobalState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  errorServer: any;
  setErrorServer: (errorServer: any) => void;
  selectedMotorcycleId: string | null;
  setSelectedMotorcycleId: (selectedMotorcycleId: string | null) => void;
  isReminderEnabled: boolean;
  setIsReminderEnabled: (isReminderEnabled: boolean) => void;
  isDistanceReminderEnabled: boolean;
  setIsDistanceReminderEnabled: (isDistanceReminderEnabled: boolean) => void;
  distanceInterval: number;
  setDistanceInterval: (distanceInterval: number) => void;
  isTimeReminderEnabled: boolean;
  setIsTimeReminderEnabled: (isTimeReminderEnabled: boolean) => void;
  timeInterval: number;
  setTimeInterval: (timeInterval: number) => void;
}

const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      loading: false,
      setLoading: (loading) => set({ loading }),
      errorServer: {},
      setErrorServer: (errorServer) => set({ errorServer }),
      selectedMotorcycleId: null,
      setSelectedMotorcycleId: (selectedMotorcycleId) => set({ selectedMotorcycleId }),
      isReminderEnabled: false,
      setIsReminderEnabled: (isReminderEnabled) => set({ isReminderEnabled }),
      isDistanceReminderEnabled: false,
      setIsDistanceReminderEnabled: (isDistanceReminderEnabled) => set({ isDistanceReminderEnabled }),
      distanceInterval: 2000,
      setDistanceInterval: (distanceInterval) => set({ distanceInterval }),
      isTimeReminderEnabled: false,
      setIsTimeReminderEnabled: (isTimeReminderEnabled) => set({ isTimeReminderEnabled }),
      timeInterval: 2,
      setTimeInterval: (timeInterval) => set({ timeInterval }),
    }),
    {
      name: 'global-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useGlobalStore;
