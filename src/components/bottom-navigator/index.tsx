import React from 'react';
import { View } from 'react-native';
import tw from '../../../tailwind';
import TabItem from '../tab-item';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const BottomNavigator: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={tw.style('bg-dark')}>
      <View
        style={tw.style(
          'flex-row justify-between px-14 py-4 mb-1 shadow-2xl bg-secondary',
        )}>
        {state.routes.map((tabRoute, tabIndex) => {
          const { options } = descriptors[tabRoute.key];
          const rawLabel =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : tabRoute.name;

          const label = typeof rawLabel === 'string' ? rawLabel : tabRoute.name;

          const isFocused = state.index === tabIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: tabRoute.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tabRoute.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: tabRoute.key,
            });
          };

          return (
            <TabItem
              key={tabIndex}
              size={26}
              title={label}
              active={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavigator;
