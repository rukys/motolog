/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import tw from '../../../tailwind';
import { Bell, Bike, History, Home } from 'lucide-react-native';

const TabItem = ({ title, active, size, onPress, onLongPress }) => {
  const Icon = () => {
    if (title === 'HomeScreen') {
      return (
        <>
          <Home size={size} color={tw.color(active ? 'primary' : 'darkGrey')} />
          {/* <Text
            style={tw.style(
              'font-bold mt-1 text-sm',
              active ? 'text-primary' : 'text-darkGrey',
            )}>
            Home
          </Text> */}
        </>
      );
    }
    if (title === 'GarageScreen') {
      return (
        <>
          <Bike size={size} color={tw.color(active ? 'primary' : 'darkGrey')} />
          {/* <Text
            style={tw.style(
              'font-bold mt-1 text-sm',
              active ? 'text-primary' : 'text-darkGrey',
            )}>
            Garage
          </Text> */}
        </>
      );
    }
    if (title === 'HistoryScreen') {
      return (
        <>
          <History
            size={size}
            color={tw.color(active ? 'primary' : 'darkGrey')}
          />
          {/* <Text
            style={tw.style(
              'font-bold mt-1 text-sm',
              active ? 'text-primary' : 'text-darkGrey',
            )}>
            History
          </Text> */}
        </>
      );
    }
    if (title === 'RemindersScreen') {
      return (
        <>
          <Bell size={size} color={tw.color(active ? 'primary' : 'darkGrey')} />
          {/* <Text
            style={tw.style(
              'font-bold mt-1 text-sm',
              active ? 'text-primary' : 'text-darkGrey',
            )}>
            Reminders
          </Text> */}
        </>
      );
    }
  };

  return (
    <TouchableOpacity
      style={tw.style('items-center mb-3')}
      onPress={onPress}
      onLongPress={onLongPress}>
      <Icon />
    </TouchableOpacity>
  );
};

export default TabItem;
