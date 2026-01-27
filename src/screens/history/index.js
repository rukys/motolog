import { View, Text } from 'react-native';
import React from 'react';
import { Container } from '../../components';
import tw from '../../../tailwind';
import EmptyHistory from '../../components/empty-history';

export default function HistoryScreen() {
  return (
    <Container>
      <View style={tw.style('flex-1 items-center justify-center mx-6')}>
        <EmptyHistory />
      </View>
    </Container>
  );
}
