import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from '../../../tailwind';
import { Wrench, Calendar, Gauge, MapPin, Trash2 } from 'lucide-react-native';
import BaseCard from '../base-card';
import { Service } from '../../models/service';
import Realm from 'realm';

interface ServiceItem {
  type: string;
  description?: string;
  price: number | string;
}

interface ServiceCardProps {
  service: Service;
  motorcycleName?: string;
  onPress?: () => void;
  onDelete?: (id: Realm.BSON.ObjectId) => void;
}

const ServiceCard = memo<ServiceCardProps>(
  ({ service, motorcycleName = '', onPress, onDelete }) => {
    const handleDelete = () => {
      Alert.alert(
        'Delete Service',
        'Are you sure you want to delete this service record?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete?.(service._id),
          },
        ],
      );
    };

    const formatDate = (date?: Date) => {
      if (!date) {
        return '-';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const formatCurrency = (amount?: number) => {
      if (!amount || amount === 0) {
        return 'Rp 0';
      }
      return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const items = (() => {
      try {
        let parsedItems = JSON.parse(service.items || '[]');
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
    })();

    return (
      <BaseCard onPress={onPress} style={tw.style('mb-3')}>
        <View style={tw.style('flex-row items-center mb-3')}>
          <View style={tw.style('bg-primary/15 rounded-xl p-2.5 mr-3')}>
            <Wrench size={22} color={tw.color('primary')} />
          </View>
          <View style={tw.style('flex-1')}>
            <Text
              style={tw.style('text-white font-montserratBold text-base')}
              numberOfLines={1}>
              {service.serviceType}
            </Text>
            <Text
              style={tw.style('text-darkGrey font-montserrat text-sm')}
              numberOfLines={1}>
              {motorcycleName}
            </Text>
          </View>
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={tw.style('p-2')}>
              <Trash2 size={18} color={tw.color('error')} />
            </TouchableOpacity>
          )}
        </View>

        <View style={tw.style('flex-row items-center mb-2')}>
          <View style={tw.style('flex-row items-center flex-1')}>
            <Calendar size={14} color={tw.color('grey')} />
            <Text style={tw.style('text-grey font-montserrat text-sm ml-1')}>
              {formatDate(service.serviceDate)}
            </Text>
          </View>
          <View style={tw.style('flex-row items-center')}>
            <Gauge size={14} color={tw.color('grey')} />
            <Text style={tw.style('text-grey font-montserrat text-sm ml-1')}>
              {service.odometerAtService?.toLocaleString() || 0} KM
            </Text>
          </View>
        </View>

        <View style={tw.style('flex-row items-center')}>
          {service.workshop ? (
            <View style={tw.style('flex-row items-center flex-1')}>
              <MapPin size={14} color={tw.color('grey')} />
              <Text
                style={tw.style('text-grey font-montserrat text-sm ml-1')}
                numberOfLines={1}>
                {service.workshop}
              </Text>
            </View>
          ) : (
            <View style={tw.style('flex-1')} />
          )}
          <Text style={tw.style('text-primary font-montserratBold text-sm')}>
            {formatCurrency(service.cost)}
          </Text>
        </View>

        {items.length > 0 && (
          <View style={tw.style('flex-row flex-wrap mt-3')}>
            {items.map((serviceItem: ServiceItem, index: number) => (
              <View
                key={index}
                style={tw.style(
                  'bg-primarySoft rounded-lg px-3 py-1 mr-2 mb-1',
                )}>
                <Text style={tw.style('text-primary font-montserrat text-xs')}>
                  {serviceItem.type}
                </Text>
              </View>
            ))}
          </View>
        )}
      </BaseCard>
    );
  },
);

export default ServiceCard;
