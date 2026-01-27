import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from '../../../tailwind';

const Container = ({
  children,
  styles,
  edges = ['top', 'bottom', 'left', 'right'],
}) => {
  return (
    <SafeAreaView style={tw.style('flex-1 bg-dark', styles)} edges={edges}>
      {children}
    </SafeAreaView>
  );
};

export default Container;
