import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import tw from '../../../tailwind';

const BaseCard = memo(({ children, onPress, activeOpacity = 0.7, style, ...props }) => {
  const containerStyle = tw.style(
    'bg-secondary rounded-2xl p-4 border border-darkGrey',
    style
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={containerStyle}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
});

export default BaseCard;
