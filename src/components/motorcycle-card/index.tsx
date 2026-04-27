import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from '../../../tailwind';
import { Bike, Trash2, Hash, Gauge } from 'lucide-react-native';
import BaseCard from '../base-card';
import { Motorcycle } from '../../models/motorcycle';
import Realm from 'realm';

interface MotorcycleCardProps {
  motorcycle: Motorcycle;
  onPress?: () => void;
  onDelete?: (id: Realm.BSON.ObjectId) => void;
}

const MotorcycleCard = memo<MotorcycleCardProps>(
  ({ motorcycle, onPress, onDelete }) => {
    const handleDelete = () => {
      Alert.alert(
        'Delete Motorcycle',
        `Are you sure you want to delete "${motorcycle.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete?.(motorcycle._id),
          },
        ],
      );
    };

    return (
      <BaseCard onPress={onPress} style={tw.style('mb-3')}>
        <View style={tw.style('flex-row items-center mb-3')}>
          <View style={tw.style('bg-primary/15 rounded-xl p-2.5 mr-3')}>
            <Bike size={24} color={tw.color('primary')} />
          </View>
          <View style={tw.style('flex-1')}>
            <Text
              style={tw.style('text-white font-montserratBold text-base')}
              numberOfLines={1}>
              {motorcycle.name}
            </Text>
            <Text
              style={tw.style('text-darkGrey font-montserrat text-sm')}
              numberOfLines={1}>
              {motorcycle.model}
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

        <View style={tw.style('flex-row items-center')}>
          <View style={tw.style('flex-row items-center flex-1')}>
            <Hash size={14} color={tw.color('grey')} />
            <Text style={tw.style('text-grey font-montserrat text-sm ml-1')}>
              {motorcycle.plateNumber}
            </Text>
          </View>
          <View style={tw.style('flex-row items-center')}>
            <Gauge size={14} color={tw.color('grey')} />
            <Text style={tw.style('text-grey font-montserrat text-sm ml-1')}>
              {motorcycle.currentOdoMeter.toLocaleString()} KM
            </Text>
          </View>
        </View>
      </BaseCard>
    );
  },
);

export default MotorcycleCard;
