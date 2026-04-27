import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import React, { useCallback } from 'react';
import { Container, EmptyState, MotorcycleCard } from '../../components';
import tw from '../../../tailwind';
import { Plus, Bike } from 'lucide-react-native';
import { useMotorcycle } from '../../hooks';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, MainTabParamList } from '../../navigations';
import { Motorcycle } from '../../models/motorcycle';
import Realm from 'realm';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'GarageScreen'>,
  StackScreenProps<RootStackParamList>
>;

export default function GarageScreen({ navigation }: Props) {
  const { motorcycles, motorcycleCount, deleteMotorcycle } = useMotorcycle();

  const handleDelete = useCallback((motorcycleId: Realm.BSON.ObjectId) => {
    deleteMotorcycle(motorcycleId);
  }, [deleteMotorcycle]);

  const renderItem = useCallback(({ item }: { item: Motorcycle }) => (
    <MotorcycleCard
      motorcycle={item}
      onPress={() =>
        navigation.navigate('MotorcycleDetailScreen', {
          id: item._id.toHexString(),
        })
      }
      onDelete={handleDelete}
    />
  ), [navigation, handleDelete]);

  return (
    <Container>
      <View style={tw.style('flex-row items-center mx-6')}>
        <View style={tw.style('flex-1')}>
          <Text style={tw.style('text-2xl font-montserratBold text-white')}>
            My Garage
          </Text>
          <Text style={tw.style('text-sm font-montserrat text-darkGrey')}>
            {motorcycleCount} {motorcycleCount === 1 ? 'motorcycle' : 'motorcycles'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('MotorcycleScreen')}
          style={tw.style('bg-primary p-2 px-6 rounded-xl flex-row items-center')}
        >
          <Plus size={22} color={tw.color('white')} />
          <Text style={tw.style('text-base font-montserratBold text-white ml-2')}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {motorcycleCount === 0 ? (
        <View style={tw.style('flex-1 items-center justify-center')}>
          <EmptyState
            icon={Bike}
            title="No motorcycle yet"
            buttonText="Add your first one"
            buttonStyle={tw.style('bg-transparent p-2')}
            buttonTextStyle={tw.style('text-primary')}
            onPressButton={() => navigation.navigate('MotorcycleScreen')}
          />
        </View>
      ) : (
        <FlatList
          data={motorcycles}
          renderItem={renderItem}
          keyExtractor={item => item._id.toHexString()}
          contentContainerStyle={tw.style('mx-6 mt-6 pb-6')}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
}
