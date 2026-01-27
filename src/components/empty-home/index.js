import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Bike, Plus } from 'lucide-react-native';
import tw from '../../../tailwind';

const EmptyHome = ({ onPress = () => {} }) => {
  return (
    <View style={tw.style('items-center justify-center mx-12')}>
      <View style={tw.style(' bg-secondary rounded-full p-6 mb-6')}>
        <Bike size={50} color={tw.color('primary')} />
      </View>
      <View style={tw.style('mb-8')}>
        <Text
          style={tw.style(
            'text-2xl font-montserratBold text-white text-center mb-2',
          )}>
          Your Garage is Empty
        </Text>
        <Text
          style={tw.style('font-montserrat text-darkGrey text-sm text-center')}>
          Add your first motorcycle to start tracking service history and
          expenses
        </Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        style={tw.style(
          'flex-row items-center bg-primary p-3.5 px-8 rounded-xl justify-center',
        )}>
        <Plus size={22} color={tw.color('white')} />
        <Text style={tw.style('text-white ml-2 font-montserratBold text-base')}>
          Add Motorcycle
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyHome;
