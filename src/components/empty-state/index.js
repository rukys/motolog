import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../../../tailwind';

const EmptyState = memo(({
  icon: Icon,
  iconSize = 50,
  iconColor,
  iconContainerStyle,
  title,
  titleStyle,
  description,
  descriptionStyle,
  buttonText,
  buttonIcon: ButtonIcon,
  onPressButton,
  buttonStyle,
  buttonTextStyle,
}) => {
  return (
    <View style={tw.style('items-center justify-center py-6 px-4')}>
      {Icon && (
        <View
          style={tw.style(
            'bg-secondary rounded-full p-6 mb-6',
            iconContainerStyle,
          )}>
          <Icon size={iconSize} color={iconColor || tw.color('darkGrey')} />
        </View>
      )}

      <View style={tw.style('mb-8')}>
        {title && (
          <Text
            style={tw.style(
              'text-2xl font-montserratBold text-white text-center mb-2',
              titleStyle,
            )}>
            {title}
          </Text>
        )}
        {description && (
          <Text
            style={tw.style(
              'font-montserrat text-darkGrey text-sm text-center',
              descriptionStyle,
            )}>
            {description}
          </Text>
        )}
      </View>

      {buttonText && onPressButton && (
        <TouchableOpacity
          onPress={onPressButton}
          style={tw.style(
            'flex-row items-center justify-center p-3.5 px-8 rounded-xl',
            buttonStyle,
          )}>
          {ButtonIcon && <ButtonIcon size={22} color={tw.color('white')} />}
          <Text
            style={tw.style(
              'text-white font-montserratBold text-base',
              ButtonIcon ? 'ml-2' : '',
              buttonTextStyle,
            )}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

export default EmptyState;
