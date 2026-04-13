import { View, Text, FlatList, TextInput } from 'react-native';
import React, { useMemo, useState, useCallback } from 'react';
import { Container, EmptyState, ServiceCard } from '../../components';
import tw from '../../../tailwind';
import { Search, FileText } from 'lucide-react-native';
import { useService } from '../../hooks/use-service';
import { useMotorcycle } from '../../hooks';

export default function HistoryScreen({ navigation }) {
  const { services, serviceCount, deleteService } = useService();
  const { motorcycles } = useMotorcycle();

  // Build a lookup map: motorcycleId (hex) → motorcycle name
  const motorcycleMap = useMemo(() => {
    const map = {};
    motorcycles.forEach(m => {
      map[m._id.toHexString()] = m.name;
    });
    return map;
  }, [motorcycles]);

  const [searchQuery, setSearchQuery] = useState('');

  // Filter services by search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }
    const query = searchQuery.toLowerCase();
    return services.filter(s => {
      const type = (s.serviceType || '').toLowerCase();
      const workshop = (s.workshop || '').toLowerCase();
      const motoName = (
        motorcycleMap[s.motorcycleId?.toHexString()] || ''
      ).toLowerCase();
      return (
        type.includes(query) ||
        workshop.includes(query) ||
        motoName.includes(query)
      );
    });
  }, [services, searchQuery, motorcycleMap]);

  const handleDelete = useCallback(serviceId => {
    deleteService(serviceId);
  }, [deleteService]);

  const renderItem = useCallback(({ item }) => (
    <ServiceCard
      service={item}
      motorcycleName={
        motorcycleMap[item.motorcycleId?.toHexString()] || 'Unknown'
      }
      onPress={() =>
        navigation.navigate('ServiceDetailScreen', {
          serviceId: item._id.toHexString(),
        })
      }
      onDelete={handleDelete}
    />
  ), [navigation, motorcycleMap, handleDelete]);

  return (
    <Container>
      {/* Header */}
      <View style={tw.style('mx-6')}>
        <Text style={tw.style('text-2xl font-montserratBold text-white')}>
          Service History
        </Text>
        <Text style={tw.style('text-sm font-montserrat text-darkGrey')}>
          {serviceCount} {serviceCount === 1 ? 'record' : 'records'}
        </Text>
      </View>

      {serviceCount === 0 ? (
        <View style={tw.style('flex-1 items-center justify-center')}>
          <EmptyState
            icon={FileText}
            title="No Service Records"
            description="Your service history will appear here once you log your first service"
          />
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View
            style={tw.style(
              'mx-6 mt-4 mb-2 flex-row items-center bg-secondary rounded-xl border border-darkGrey px-4',
            )}>
            <Search size={18} color={tw.color('darkGrey')} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by service, workshop, motorcycle..."
              placeholderTextColor={tw.color('darkGrey')}
              style={tw.style(
                'flex-1 ml-3 py-3 text-white font-montserrat text-sm',
              )}
            />
          </View>

          <FlatList
            data={filteredServices}
            renderItem={renderItem}
            keyExtractor={item => item._id.toHexString()}
            contentContainerStyle={tw.style('mx-6 mt-2 pb-6')}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={tw.style('items-center py-10')}>
                <Text
                  style={tw.style(
                    'text-darkGrey font-montserrat text-sm',
                  )}>
                  No results found for "{searchQuery}"
                </Text>
              </View>
            }
          />
        </>
      )}
    </Container>
  );
}
