import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Container, ServiceCard, EmptyState } from '../../components';
import tw from '../../../tailwind';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Bike,
  Gauge,
  Hash,
  Calendar,
  Wrench,
  Search,
  Plus,
} from 'lucide-react-native';
import { useMotorcycle } from '../../hooks';
import { useService } from '../../hooks/use-service';
import Realm from 'realm';

export default function MotorcycleDetailScreen({ navigation, route }) {
  const motorcycleId = route?.params?.motorcycleId;
  const { motorcycles } = useMotorcycle();
  const { getServicesByMotorcycle, deleteService } = useService();

  // Find the motorcycle from the reactive collection
  const motorcycle = useMemo(() => {
    return motorcycles.find(motorcycleItem => motorcycleItem._id.toHexString() === motorcycleId);
  }, [motorcycles, motorcycleId]);

  // Get services for this motorcycle
  const services = useMemo(() => {
    if (!motorcycleId) {
      return [];
    }
    try {
      return getServicesByMotorcycle(new Realm.BSON.ObjectId(motorcycleId));
    } catch {
      return [];
    }
  }, [motorcycleId, getServicesByMotorcycle]);

  const [searchQuery, setSearchQuery] = useState('');

  // Filter services by search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }
    const searchTerm = searchQuery.toLowerCase();
    return services.filter(serviceRecord => {
      const type = (serviceRecord.serviceType || '').toLowerCase();
      const workshop = (serviceRecord.workshop || '').toLowerCase();
      return type.includes(searchTerm) || workshop.includes(searchTerm);
    });
  }, [services, searchQuery]);

  const handleDeleteService = useCallback(
    serviceId => {
      deleteService(serviceId);
    },
    [deleteService],
  );

  const formatDate = date => {
    if (!date) {
      return '-';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!motorcycle) {
    return (
      <Container edges={[]}>
        <SafeAreaView style={tw.style('flex-1 items-center justify-center')}>
          <Text style={tw.style('text-white font-montserrat text-base')}>
            Motorcycle not found
          </Text>
        </SafeAreaView>
      </Container>
    );
  }

  const hasImage = motorcycle.image && motorcycle.image.length > 0;

  return (
    <Container edges={[]}>
      <SafeAreaView style={tw.style('flex-1')}>
        {/* Header */}
        <View style={tw.style('flex-row items-center mx-6 mb-4')}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronLeft size={24} color={tw.color('white')} />
          </TouchableOpacity>
          <Text
            style={tw.style(
              'flex-1 ml-6 text-2xl font-montserratBold text-white',
            )}
            numberOfLines={1}>
            {motorcycle.name}
          </Text>
        </View>

        {/* Content */}
        <FlatList
          data={filteredServices}
          keyExtractor={item => item._id.toHexString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw.style('mx-6 pb-6')}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              motorcycleName={motorcycle?.name}
              onPress={() =>
                navigation.navigate('ServiceDetailScreen', {
                  serviceId: item._id.toHexString(),
                })
              }
              onDelete={handleDeleteService}
            />
          )}
          ListHeaderComponent={
            <View style={tw.style('mb-6')}>
              {/* Motorcycle Photo or Placeholder */}
              <View style={tw.style('items-center mb-6')}>
                {hasImage ? (
                  <Image
                    source={{ uri: `file://${motorcycle.image}` }}
                    style={tw.style('w-40 h-40 rounded-2xl')}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={tw.style(
                      'bg-secondary w-40 h-40 rounded-2xl items-center justify-center border border-darkGrey',
                    )}>
                    <Bike size={60} color={tw.color('darkGrey')} />
                  </View>
                )}
              </View>

              {/* Info Cards */}
              <View
                style={tw.style(
                  'bg-secondary rounded-2xl p-5 border border-darkGrey mb-4',
                )}>
                {/* Name & Model */}
                <Text
                  style={tw.style(
                    'text-white font-montserratBold text-xl mb-1',
                  )}>
                  {motorcycle.name}
                </Text>
                <Text
                  style={tw.style(
                    'text-darkGrey font-montserrat text-base mb-4',
                  )}>
                  {motorcycle.model}
                </Text>

                {/* Details grid */}
                <View style={tw.style('flex-row mb-3')}>
                  <View style={tw.style('flex-1 flex-row items-center')}>
                    <Hash size={16} color={tw.color('primary')} />
                    <View style={tw.style('ml-2')}>
                      <Text
                        style={tw.style(
                          'text-darkGrey font-montserrat text-xs',
                        )}>
                        Plate Number
                      </Text>
                      <Text
                        style={tw.style(
                          'text-white font-montserratSemiBold text-sm',
                        )}>
                        {motorcycle.plateNumber}
                      </Text>
                    </View>
                  </View>
                  <View style={tw.style('flex-1 flex-row items-center')}>
                    <Gauge size={16} color={tw.color('primary')} />
                    <View style={tw.style('ml-2')}>
                      <Text
                        style={tw.style(
                          'text-darkGrey font-montserrat text-xs',
                        )}>
                        Odometer
                      </Text>
                      <Text
                        style={tw.style(
                          'text-white font-montserratSemiBold text-sm',
                        )}>
                        {motorcycle.currentOdoMeter?.toLocaleString()} KM
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={tw.style('flex-row')}>
                  <View style={tw.style('flex-1 flex-row items-center')}>
                    <Calendar size={16} color={tw.color('primary')} />
                    <View style={tw.style('ml-2')}>
                      <Text
                        style={tw.style(
                          'text-darkGrey font-montserrat text-xs',
                        )}>
                        Added On
                      </Text>
                      <Text
                        style={tw.style(
                          'text-white font-montserratSemiBold text-sm',
                        )}>
                        {formatDate(motorcycle.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={tw.style('flex-1 flex-row items-center')}>
                    <Wrench size={16} color={tw.color('primary')} />
                    <View style={tw.style('ml-2')}>
                      <Text
                        style={tw.style(
                          'text-darkGrey font-montserrat text-xs',
                        )}>
                        Total Services
                      </Text>
                      <Text
                        style={tw.style(
                          'text-white font-montserratSemiBold text-sm',
                        )}>
                        {services.length}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Service History Header */}
              <View
                style={tw.style('flex-row items-center justify-between mb-3')}>
                <Text
                  style={tw.style('text-white font-montserratBold text-lg')}>
                  Service History
                </Text>
                <Text style={tw.style('text-darkGrey font-montserrat text-sm')}>
                  {services.length}{' '}
                  {services.length === 1 ? 'record' : 'records'}
                </Text>
              </View>

              {/* Search Bar */}
              {services.length > 0 && (
                <View
                  style={tw.style(
                    'flex-row items-center bg-secondary rounded-xl border border-darkGrey px-4',
                  )}>
                  <Search size={18} color={tw.color('darkGrey')} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search service or workshop..."
                    placeholderTextColor={tw.color('darkGrey')}
                    style={tw.style(
                      'flex-1 ml-3 py-3 text-white font-montserrat text-sm',
                    )}
                  />
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            searchQuery.trim() ? (
              <View style={tw.style('items-center py-10')}>
                <Text style={tw.style('text-darkGrey font-montserrat text-sm')}>
                  No results found for "{searchQuery}"
                </Text>
              </View>
            ) : (
              <EmptyState
                icon={Wrench}
                iconSize={36}
                iconContainerStyle={tw.style('p-5 mb-4')}
                title="No services yet"
                titleStyle={tw.style('text-grey text-base mb-1')}
                description="Tap the + button to add a new service"
              />
            )
          }
        />
      </SafeAreaView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ServiceScreen', {
            motorcycleId: motorcycle?._id?.toHexString(),
            motorcycleName: motorcycle?.name,
            motorcyclePlate: motorcycle?.plateNumber,
          })
        }
        activeOpacity={0.8}
        style={tw.style(
          'absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center',
          {
            shadowColor: '#ff6600',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          },
        )}>
        <Plus size={26} color={tw.color('white')} />
      </TouchableOpacity>
    </Container>
  );
}
