import React, { memo } from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle, ViewProps } from 'react-native';
import tw from '../../../tailwind';

interface BaseCardProps extends ViewProps {
  children?: React.ReactNode;
  onPress?: () => void;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
}

const BaseCard = memo<BaseCardProps>(
  ({ children, onPress, activeOpacity = 0.7, style, ...props }) => {
    const containerStyle = [
      tw.style('bg-secondary rounded-2xl p-4 border border-darkGrey'),
      style,
    ];

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={activeOpacity}
          style={containerStyle}
          {...props}>
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <View style={containerStyle} {...props}>
        {children}
      </View>
    );
  },
);

export default BaseCard;
