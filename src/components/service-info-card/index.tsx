import React from 'react';
import { View, Text } from 'react-native';
import tw from '../../../tailwind';
import BaseCard from '../base-card';

interface ServiceInfoCardProps {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}

const ServiceInfoCard: React.FC<ServiceInfoCardProps> = ({
  icon,
  title,
  children,
}) => {
  return (
    <BaseCard style={tw.style('p-5 mb-4')}>
      <View style={tw.style('flex-row items-center mb-4')}>
        {icon}
        <Text style={tw.style('text-white font-montserratBold text-lg ml-2')}>
          {title}
        </Text>
      </View>
      {children}
    </BaseCard>
  );
};

export default ServiceInfoCard;
