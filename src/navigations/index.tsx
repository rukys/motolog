import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeScreen,
  HistoryScreen,
  GarageScreen,
  RemindersScreen,
  ReminderSettingsScreen,
  SplashScreen,
  MotorcycleScreen,
  MotorcycleDetailScreen,
  ServiceScreen,
  ServiceDetailScreen,
  MotoAIScreen,
} from '../screens';
import { BottomNavigator } from '../components';

// --- Type Definitions ---
export type RootStackParamList = {
  SplashScreen: undefined;
  AppBarScreen: undefined;
  MotorcycleScreen: { id?: string } | undefined;
  MotorcycleDetailScreen: { id: string };
  ServiceScreen: {
    motorcycleId: string;
    serviceId?: string;
    motorcycleName?: string;
    motorcyclePlate?: string;
  };
  ServiceDetailScreen: { id: string };
  ReminderSettingsScreen: { id: string };
  MotoAIScreen: undefined;
};

export type MainTabParamList = {
  HomeScreen: undefined;
  GarageScreen: undefined;
  HistoryScreen: undefined;
  RemindersScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AppBarScreen = () => {
  return (
    <Tab.Navigator tabBar={(props) => <BottomNavigator {...props} />}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen as any}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="GarageScreen"
        component={GarageScreen as any}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HistoryScreen"
        component={HistoryScreen as any}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="RemindersScreen"
        component={RemindersScreen as any}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const Navigations = () => {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen as any} />
      <Stack.Screen name="AppBarScreen" component={AppBarScreen} />
      <Stack.Screen name="MotorcycleScreen" component={MotorcycleScreen as any} />
      <Stack.Screen name="MotorcycleDetailScreen" component={MotorcycleDetailScreen as any} />
      <Stack.Screen name="ServiceScreen" component={ServiceScreen as any} />
      <Stack.Screen name="ServiceDetailScreen" component={ServiceDetailScreen as any} />
      <Stack.Screen name="ReminderSettingsScreen" component={ReminderSettingsScreen as any} />
      <Stack.Screen name="MotoAIScreen" component={MotoAIScreen as any} />
    </Stack.Navigator>
  );
};

export default Navigations;
