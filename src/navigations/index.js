import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  HomeScreen,
  HistoryScreen,
  GarageScreen,
  RemindersScreen,
  SplashScreen,
} from '../screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigator } from '../components';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppBarScreen = () => {
  return (
    <Tab.Navigator tabBar={props => <BottomNavigator {...props} />}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="GarageScreen"
        component={GarageScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="RemindersScreen"
        component={RemindersScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const Navigations = () => {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="AppBarScreen" component={AppBarScreen} />
    </Stack.Navigator>
  );
};

export default Navigations;
