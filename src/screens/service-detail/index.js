import React, {useMemo} from 'react';
import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native';
import {Container} from '../../components';
import tw from '../../../tailwind';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Wrench,
  Calendar,
  Gauge,
  MapPin,
  Bike,
  FileText,
  Receipt,
} from 'lucide-react-native';
import {useService} from '../../hooks/use-service';
import {useMotorcycle} from '../../hooks';
import Realm from 'realm';

export default function ServiceDetailScreen({navigation, route}) {
  const serviceId = route?.params?.serviceId;
  const {services} = useService();
  const {motorcycles} = useMotorcycle();

  // Find the service
  const service = useMemo(() => {
    return services.find(serviceRecord => serviceRecord._id.toHexString() === serviceId);
  }, [services, serviceId]);

  // Find the associated motorcycle
  const motorcycle = useMemo(() => {
    if (!service) {
      return null;
    }
    return motorcycles.find(
      motorcycleItem => motorcycleItem._id.toHexString() === service.motorcycleId?.toHexString(),
    );
  }, [service, motorcycles]);

  const items = useMemo(() => {
    try {
      let parsedItems = JSON.parse(service?.items || '[]');
      if (!Array.isArray(parsedItems)) {
        if (typeof parsedItems === 'string') {
          parsedItems = JSON.parse(parsedItems);
        }
        if (!Array.isArray(parsedItems)) {
          parsedItems = [];
        }
      }
      return parsedItems;
    } catch {
      return [];
    }
  }, [service]);

  // Parse receipt photos
  const photos = useMemo(() => {
    if (!service?.receiptPhotos) {
      return [];
    }
    return Array.from(service.receiptPhotos);
  }, [service]);

  const formatDate = date => {
    if (!date) {
      return '-';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = amount => {
    if (!amount || amount === 0) {
      return 'Rp 0';
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  if (!service) {
    return (
      <Container edges={[]}>
        <SafeAreaView style={tw.style('flex-1 items-center justify-center')}>
          <Text style={tw.style('text-white font-montserrat text-base')}>
            Service not found
          </Text>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container edges={[]}>
      <SafeAreaView style={tw.style('flex-1')}>
        {/* Header */}
        <View style={tw.style('flex-row items-center mx-6 mb-4')}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
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
          contentContainerStyle={tw.style('px-6 pb-8')}>
          {/* ─── Service Type Header ───────────────────────────────── */}
          <View
            style={tw.style(
              'bg-secondary rounded-2xl p-5 border border-darkGrey mb-4',
            )}>
            <View style={tw.style('flex-row items-center mb-3')}>
              <View style={tw.style('bg-primary/15 rounded-xl p-3 mr-4')}>
                <Wrench size={28} color={tw.color('primary')} />
              </View>
              <View style={tw.style('flex-1')}>
                <Text
                  style={tw.style(
                    'text-white font-montserratBold text-xl',
                  )}>
                  {service.serviceType}
                </Text>
                <Text
                  style={tw.style(
                    'text-primary font-montserratBold text-lg mt-1',
                  )}>
                  {formatCurrency(service.cost)}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Motorcycle Info ───────────────────────────────────── */}
          {motorcycle && (
            <View
              style={tw.style(
                'bg-secondary rounded-2xl p-4 border border-darkGrey mb-4 flex-row items-center',
              )}>
              <View
                style={tw.style(
                  'bg-darkGrey rounded-full w-10 h-10 items-center justify-center mr-3',
                )}>
                <Bike size={18} color={tw.color('white')} />
              </View>
              <View style={tw.style('flex-1')}>
                <Text
                  style={tw.style(
                    'text-white font-montserratBold text-base',
                  )}>
                  {motorcycle.name}
                </Text>
                <Text
                  style={tw.style(
                    'text-darkGrey font-montserrat text-sm',
                  )}>
                  {motorcycle.plateNumber}
                </Text>
              </View>
            </View>
          )}

          {/* ─── Details Grid ─────────────────────────────────────── */}
          <View
            style={tw.style(
              'bg-secondary rounded-2xl p-5 border border-darkGrey mb-4',
            )}>
            {/* Date */}
            <View style={tw.style('flex-row items-center mb-4')}>
              <Calendar size={18} color={tw.color('primary')} />
              <View style={tw.style('ml-3 flex-1')}>
                <Text
                  style={tw.style(
                    'text-darkGrey font-montserrat text-xs',
                  )}>
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

            {/* Odometer */}
            <View style={tw.style('flex-row items-center mb-4')}>
              <Gauge size={18} color={tw.color('primary')} />
              <View style={tw.style('ml-3 flex-1')}>
                <Text
                  style={tw.style(
                    'text-darkGrey font-montserrat text-xs',
                  )}>
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

            {/* Workshop */}
            {service.workshop ? (
              <View style={tw.style('flex-row items-center')}>
                <MapPin size={18} color={tw.color('primary')} />
                <View style={tw.style('ml-3 flex-1')}>
                  <Text
                    style={tw.style(
                      'text-darkGrey font-montserrat text-xs',
                    )}>
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

          {/* ─── Service Items ────────────────────────────────────── */}
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

              {items.map((item, index) => (
                <View
                  key={index}
                  style={tw.style(
                    'flex-row items-center py-3',
                    index < items.length - 1
                      ? 'border-b border-darkGrey'
                      : '',
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

              {/* Total */}
              <View
                style={tw.style(
                  'flex-row items-center justify-between pt-4 mt-1 border-t border-darkGrey',
                )}>
                <Text
                  style={tw.style(
                    'text-white font-montserratBold text-base',
                  )}>
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

          {/* ─── Notes ────────────────────────────────────────────── */}
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
                style={tw.style(
                  'text-grey font-montserrat text-sm leading-5',
                )}>
                {service.notes}
              </Text>
            </View>
          ) : null}

          {/* ─── Receipt Photos ────────────────────────────────────── */}
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
                    source={{uri: `file://${photoPath}`}}
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
