import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import tw from '../../../tailwind';

interface ContainerProps {
  children?: React.ReactNode;
  styles?: StyleProp<ViewStyle>;
  edges?: Edge[];
}

const Container: React.FC<ContainerProps> = ({
  children,
  styles,
  edges = ['top', 'bottom', 'left', 'right'],
}) => {
  return (
    <SafeAreaView style={[tw.style('flex-1 bg-dark'), styles]} edges={edges}>
      {children}
    </SafeAreaView>
  );
};

export default Container;
