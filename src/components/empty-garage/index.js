import { Bike } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from '../../../tailwind';

const EmptyGarage = ({ onPress = () => {} }) => {
  return (
    <View style={tw.style('items-center justify-center mx-12')}>
      <View style={tw.style(' bg-secondary rounded-full p-6 mb-6')}>
        <Bike size={50} color={tw.color('darkGrey')} />
      </View>
      <View style={tw.style('mb-2')}>
        <Text
          style={tw.style(
            'font-montserratBold text-xl text-darkGrey text-center',
          )}>
          No motorcycle yet
        </Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        style={tw.style('flex-row items-center p-3.5 px-8 justify-center')}>
        <Text
          style={tw.style('text-primary ml-2 font-montserratBold text-base')}>
          Add your first one
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyGarage;
