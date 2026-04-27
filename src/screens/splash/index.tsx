import { useNavigation } from '@react-navigation/native';
import { Bike } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import tw from '../../../tailwind';
import { Container } from '../../components';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations';

type NavigationProp = StackNavigationProp<RootStackParamList, 'SplashScreen'>;

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('AppBarScreen');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Container styles={tw.style('items-center justify-center')} edges={[]}>
      <View
        style={tw.style(
          'items-center justify-center bg-secondary rounded-full p-6 mb-6',
        )}>
        <Bike size={75} color={tw.color('primary')} />
      </View>
      <ActivityIndicator size={'large'} color={tw.color('primary')} />
    </Container>
  );
}
