import { View, Text } from 'react-native';
import React from 'react';
import { Container, EmptyHome } from '../../components';
import tw from '../../../tailwind';

export default function HomeScreen() {
  return (
    <Container styles={tw.style('items-center justify-center')} edges={[]}>
      <EmptyHome />
    </Container>
  );
}
