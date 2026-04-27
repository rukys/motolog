import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import tw from '../../../tailwind';
import {
  Bike,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  Check,
} from 'lucide-react-native';
import { Motorcycle } from '../../models/motorcycle';

interface MotorcycleSelectorProps {
  motorcycles: Motorcycle[];
  activeMotorcycleId?: string;
  onSelect?: (motorcycle: Motorcycle) => void;
  onEditOdo?: (id: string, newOdo: number) => void;
}

const MotorcycleSelector: React.FC<MotorcycleSelectorProps> = ({
  motorcycles = [],
  activeMotorcycleId,
  onSelect,
  onEditOdo,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempOdo, setTempOdo] = useState('');
  const currentIndex = motorcycles.findIndex(
    motorcycle => motorcycle._id.toHexString() === activeMotorcycleId,
  );
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  const goNext = useCallback(() => {
    if (motorcycles.length === 0) {
      return;
    }
    const nextIndex = (safeIndex + 1) % motorcycles.length;
    onSelect?.(motorcycles[nextIndex]);
  }, [safeIndex, motorcycles, onSelect]);

  const goPrev = useCallback(() => {
    if (motorcycles.length === 0) {
      return;
    }
    const prevIndex = (safeIndex - 1 + motorcycles.length) % motorcycles.length;
    onSelect?.(motorcycles[prevIndex]);
  }, [safeIndex, motorcycles, onSelect]);

  if (motorcycles.length === 0) {
    return null;
  }

  const current = motorcycles[safeIndex];

  const handleEditPress = () => {
    setTempOdo(current.currentOdoMeter?.toString() || '0');
    setIsModalVisible(true);
  };

  const handleSaveOdo = () => {
    const odometerValue = parseInt(tempOdo, 10);
    if (isNaN(odometerValue) || odometerValue < 0) {
      Alert.alert('Invalid', 'Odometer must be a valid number.');
      return;
    }
    if (onEditOdo) {
      onEditOdo(current._id.toHexString(), odometerValue);
    }
    setIsModalVisible(false);
  };

  return (
    <View style={tw.style('flex-row items-center mx-6')}>
      <TouchableOpacity
        onPress={goPrev}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={tw.style('p-1')}>
        <ChevronLeft size={22} color={tw.color('darkGrey')} />
      </TouchableOpacity>

      <View
        style={tw.style(
          'flex-1 flex-row items-center bg-secondary rounded-xl p-3 mx-3 border border-primary',
        )}>
        <View
          style={tw.style(
            'bg-darkGrey rounded-full w-12 h-12 items-center justify-center mr-3',
          )}>
          <Bike size={22} color={tw.color('white')} />
        </View>

        <View style={tw.style('flex-1')}>
          <Text
            style={tw.style('text-white font-montserratBold text-base')}
            numberOfLines={1}>
            {current.name}
          </Text>
          <View style={tw.style('flex-row items-center mt-0.5')}>
            <Text
              style={tw.style('text-darkGrey font-montserrat text-sm')}
              numberOfLines={1}>
              {current.plateNumber} •{' '}
              {current.currentOdoMeter?.toLocaleString('id-ID')} KM
            </Text>
            {onEditOdo && (
              <TouchableOpacity
                onPress={handleEditPress}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                style={tw.style('ml-2')}>
                <Pencil size={14} color={tw.color('primary')} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={goNext}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={tw.style('p-1')}>
        <ChevronRight size={22} color={tw.color('darkGrey')} />
      </TouchableOpacity>

      <Modal transparent visible={isModalVisible} animationType="fade">
        <View
          style={tw.style(
            'flex-1 bg-dark/80 justify-center items-center px-6',
          )}>
          <View
            style={tw.style(
              'bg-secondary w-full rounded-2xl p-6 border border-darkGrey',
            )}>
            <View
              style={tw.style('flex-row justify-between items-center mb-4')}>
              <Text style={tw.style('text-white font-montserratBold text-lg')}>
                Update Odometer
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color={tw.color('grey')} />
              </TouchableOpacity>
            </View>
            <Text style={tw.style('text-grey font-montserrat text-sm mb-4')}>
              Quick step to keep your "{current.name}" tracker accurate.
            </Text>
            <TextInput
              value={tempOdo}
              onChangeText={setTempOdo}
              keyboardType="number-pad"
              style={tw.style(
                'bg-dark text-white font-montserratBold text-xl p-4 rounded-xl border border-primary/50 mb-6 text-center',
              )}
              autoFocus
            />
            <TouchableOpacity
              onPress={handleSaveOdo}
              style={tw.style(
                'bg-primary rounded-xl p-4 flex-row justify-center items-center',
              )}>
              <Check size={20} color={tw.color('white')} />
              <Text
                style={tw.style(
                  'text-white font-montserratBold text-base ml-2',
                )}>
                Save Update
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MotorcycleSelector;
