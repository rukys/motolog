import React from 'react';
import {Text, TextInput, View} from 'react-native';
import tw from '../../../tailwind';

const Input = ({
  label = '',
  placeholder = '',
  value,
  onChangeText = () => {},
  textInputStyles,
  containerStyles,
  error,
  keyboardType,
  autoCapitalize,
  ...rest
}) => {
  return (
    <View style={tw.style('mb-4', containerStyles)}>
      <Text style={tw.style('text-white font-montserratBold text-base')}>
        {label}
      </Text>
      <TextInput
        style={tw.style(
          'text-white font-montserrat text-base border rounded-xl p-4 mt-2',
          error ? 'border-red-500' : 'border-darkGrey',
          textInputStyles,
        )}
        placeholder={placeholder}
        placeholderTextColor={tw.color('grey')}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        {...rest}
      />
      {error ? (
        <Text style={tw.style('text-red-500 font-montserrat text-xs mt-1')}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default Input;
