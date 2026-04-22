import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from '../../../tailwind';
import { Wrench, Calendar, Gauge, MapPin, Trash2 } from 'lucide-react-native';
import BaseCard from '../base-card';

/**
 * Card component to display a service record in the history list.
 *
 * @param {Object} props
 * @param {Object} props.service - Realm Service object
 * @param {string} props.motorcycleName - Name of the associated motorcycle
 * @param {Function} [props.onPress] - On card press
 * @param {Function} [props.onDelete] - On delete press (service._id)
 */
const ServiceCard = memo(
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

    const formatCurrency = amount => {
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
        {/* Header: icon + service type + delete */}
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

        {/* Details row */}
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

        {/* Workshop + Cost row */}
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

        {/* Service items tags */}
        {items.length > 0 && (
          <View style={tw.style('flex-row flex-wrap mt-3')}>
            {items.map((serviceItem, index) => (
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
