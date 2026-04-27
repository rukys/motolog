import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Container } from '../../components';
import tw from '../../../tailwind';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Calendar,
  Gauge,
  MapPin,
  FileText,
  Receipt,
  Bike,
} from 'lucide-react-native';
import { useService } from '../../hooks/use-service';
import { useMotorcycle } from '../../hooks';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations';

type Props = StackScreenProps<RootStackParamList, 'ServiceDetailScreen'>;

interface ServiceItem {
  type: string;
  description?: string;
  price: number | string;
}

export default function ServiceDetailScreen({ navigation, route }: Props) {
  const serviceId = route?.params?.id;
  const { services } = useService();
  const { motorcycles } = useMotorcycle();

  const service = useMemo(() => {
    return services.find(s => s._id.toHexString() === serviceId);
  }, [services, serviceId]);

  const motorcycle = useMemo(() => {
    if (!service) {
      return null;
    }
    return motorcycles.find(
      m => m._id.toHexString() === service.motorcycleId?.toHexString(),
    );
  }, [motorcycles, service]);

  const items = useMemo(() => {
    if (!service?.items) {
      return [];
    }
    try {
      return JSON.parse(service.items);
    } catch (e) {
      console.error('Failed to parse service items:', e);
      return [];
    }
  }, [service?.items]);

  const formatDate = (date: Date | null) => {
    if (!date) {
      return '-';
    }
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  if (!service) {
    return (
      <Container edges={[]}>
        <SafeAreaView style={tw.style('flex-1 items-center justify-center')}>
          <Text style={tw.style('text-white font-montserrat text-base')}>
            Service record not found
          </Text>
        </SafeAreaView>
      </Container>
    );
  }

  const photos = service.receiptPhotos || [];

  return (
    <Container edges={[]}>
      <SafeAreaView style={tw.style('flex-1')}>
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
            Service Detail
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw.style('px-6 pb-24')}>
          <Text
            style={tw.style('text-primary font-montserratBold text-xl mb-4')}>
            {service.serviceType}
          </Text>

          {motorcycle && (
            <View
              style={tw.style(
                'flex-row items-center bg-secondary rounded-xl p-4 border border-darkGrey mb-4',
              )}>
              <View
                style={tw.style(
                  'bg-darkGrey rounded-full w-10 h-10 items-center justify-center mr-3',
                )}>
                <Bike size={18} color={tw.color('white')} />
              </View>
              <View style={tw.style('flex-1')}>
                <Text
                  style={tw.style('text-white font-montserratBold text-base')}>
                  {motorcycle.name}
                </Text>
                <Text style={tw.style('text-darkGrey font-montserrat text-sm')}>
                  {motorcycle.plateNumber}
                </Text>
              </View>
            </View>
          )}

          <View
            style={tw.style(
              'bg-secondary rounded-2xl p-5 border border-darkGrey mb-4',
            )}>
            <View style={tw.style('flex-row items-center mb-4')}>
              <Calendar size={18} color={tw.color('primary')} />
              <View style={tw.style('ml-3 flex-1')}>
                <Text style={tw.style('text-darkGrey font-montserrat text-xs')}>
                  Service Date
                </Text>
                <Text
                  style={tw.style(
                    'text-white font-montserratSemiBold text-base',
                  )}>
                  {formatDate(service.serviceDate)}
                </Text>
              </View>
            </View>

            <View style={tw.style('flex-row items-center mb-4')}>
              <Gauge size={18} color={tw.color('primary')} />
              <View style={tw.style('ml-3 flex-1')}>
                <Text style={tw.style('text-darkGrey font-montserrat text-xs')}>
                  ODO Reading
                </Text>
                <Text
                  style={tw.style(
                    'text-white font-montserratSemiBold text-base',
                  )}>
                  {service.odometerAtService?.toLocaleString() || 0} KM
                </Text>
              </View>
            </View>

            {service.workshop ? (
              <View style={tw.style('flex-row items-center')}>
                <MapPin size={18} color={tw.color('primary')} />
                <View style={tw.style('ml-3 flex-1')}>
                  <Text
                    style={tw.style('text-darkGrey font-montserrat text-xs')}>
                    Workshop
                  </Text>
                  <Text
                    style={tw.style(
                      'text-white font-montserratSemiBold text-base',
                    )}>
                    {service.workshop}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {items.length > 0 && (
            <View
              style={tw.style(
                'bg-secondary rounded-2xl p-5 border border-darkGrey mb-4',
              )}>
              <Text
                style={tw.style(
                  'text-white font-montserratBold text-base mb-4',
                )}>
                Service Items
              </Text>

              {items.map((item: ServiceItem, index: number) => (
                <View
                  key={index}
                  style={tw.style(
                    'flex-row items-center py-3',
                    index < items.length - 1 ? 'border-b border-darkGrey' : '',
                  )}>
                  <View style={tw.style('flex-1')}>
                    <Text
                      style={tw.style(
                        'text-white font-montserratSemiBold text-sm',
                      )}>
                      {item.type}
                    </Text>
                    {item.description ? (
                      <Text
                        style={tw.style(
                          'text-darkGrey font-montserrat text-xs mt-1',
                        )}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={tw.style(
                      'text-primary font-montserratBold text-sm',
                    )}>
                    {formatCurrency(Number(item.price) || 0)}
                  </Text>
                </View>
              ))}

              <View
                style={tw.style(
                  'flex-row items-center justify-between pt-4 mt-1 border-t border-darkGrey',
                )}>
                <Text
                  style={tw.style('text-white font-montserratBold text-base')}>
                  Total
                </Text>
                <Text
                  style={tw.style(
                    'text-primary font-montserratBold text-base',
                  )}>
                  {formatCurrency(service.cost)}
                </Text>
              </View>
            </View>
          )}

          {service.notes ? (
            <View
              style={tw.style(
                'bg-secondary rounded-2xl p-5 border border-darkGrey mb-4',
              )}>
              <View style={tw.style('flex-row items-center mb-3')}>
                <FileText size={18} color={tw.color('primary')} />
                <Text
                  style={tw.style(
                    'text-white font-montserratBold text-base ml-2',
                  )}>
                  Notes
                </Text>
              </View>
              <Text
                style={tw.style('text-grey font-montserrat text-sm leading-5')}>
                {service.notes}
              </Text>
            </View>
          ) : null}

          {photos.length > 0 && (
            <View
              style={tw.style(
                'bg-secondary rounded-2xl p-5 border border-darkGrey',
              )}>
              <View style={tw.style('flex-row items-center mb-4')}>
                <Receipt size={18} color={tw.color('primary')} />
                <Text
                  style={tw.style(
                    'text-white font-montserratBold text-base ml-2',
                  )}>
                  Receipt Photos
                </Text>
                <Text
                  style={tw.style(
                    'text-darkGrey font-montserrat text-sm ml-2',
                  )}>
                  ({photos.length})
                </Text>
              </View>
              <View style={tw.style('flex-row flex-wrap')}>
                {photos.map((photoPath, index) => (
                  <Image
                    key={index}
                    source={{ uri: `file://${photoPath}` }}
                    style={tw.style('w-24 h-24 rounded-xl mr-3 mb-3')}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
}
