import { View, Text } from 'react-native';
import React from 'react';
import tw from '../../../tailwind';
import { FileText } from 'lucide-react-native';

const EmptyHistory = () => {
  return (
    <View style={tw.style('items-center justify-center')}>
      <View style={tw.style(' bg-secondary rounded-full p-6 mb-6')}>
        <FileText size={50} color={tw.color('darkGrey')} />
      </View>
      <View style={tw.style('mb-8')}>
        <Text
          style={tw.style(
            'text-2xl font-montserratBold text-white text-center mb-2',
          )}>
          No Service Records
        </Text>
        <Text
          style={tw.style('font-montserrat text-darkGrey text-sm text-center')}>
          Your service history will appear here once you log your first service
        </Text>
      </View>
    </View>
  );
};

export default EmptyHistory;
