import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Container, EmptyGarage } from '../../components';
import tw from '../../../tailwind';
import { Plus } from 'lucide-react-native';

export default function GarageScreen() {
  return (
    <Container>
      <View style={tw.style('flex-row items-center mx-6')}>
        <View style={tw.style('flex-1')}>
          <Text style={tw.style('text-2xl font-montserratBold text-white')}>
            My Garage
          </Text>
          <Text style={tw.style('text-sm font-montserrat text-darkGrey')}>
            0 motorcycles
          </Text>
        </View>
        <TouchableOpacity
          style={tw.style(
            'bg-primary p-2 px-6 rounded-xl flex-row items-center',
          )}>
          <Plus size={22} color={tw.color('white')} />
          <Text
            style={tw.style('text-base font-montserratBold text-white ml-2')}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
      <View style={tw.style('flex-1 items-center justify-center')}>
        <EmptyGarage />
      </View>
    </Container>
  );
}
