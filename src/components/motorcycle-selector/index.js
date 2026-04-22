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

const MotorcycleSelector = ({
  motorcycles = [],
  activeMotorcycleId,
  onSelect,
  onEditOdo,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempOdo, setTempOdo] = useState('');
  const currentIndex = motorcycles.findIndex(
    m => m._id.toHexString() === activeMotorcycleId,
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
    const odoNum = parseInt(tempOdo, 10);
    if (isNaN(odoNum) || odoNum < 0) {
      Alert.alert('Invalid', 'Odometer must be a valid number.');
      return;
    }
    if (onEditOdo) {
      onEditOdo(current._id.toHexString(), odoNum);
    }
    setIsModalVisible(false);
  };

  return (
    <View style={tw.style('flex-row items-center mx-6')}>
      {/* Left Arrow */}
      <TouchableOpacity
        onPress={goPrev}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={tw.style('p-1')}>
        <ChevronLeft size={22} color={tw.color('darkGrey')} />
      </TouchableOpacity>

      {/* Card */}
      <View
        style={tw.style(
          'flex-1 flex-row items-center bg-secondary rounded-xl p-3 mx-3 border border-primary',
        )}>
        {/* Motorcycle Icon */}
        <View
          style={tw.style(
            'bg-darkGrey rounded-full w-12 h-12 items-center justify-center mr-3',
          )}>
          <Bike size={22} color={tw.color('white')} />
        </View>

        {/* Info */}
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

      {/* Right Arrow */}
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
                {
                  shadowColor: '#ff6600',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 8,
                },
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
