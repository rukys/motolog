import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { Container, Input } from '../../components';
import tw from '../../../tailwind';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronDown,
  Calendar,
  Gauge,
  Plus,
  Camera,
  X,
} from 'lucide-react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useService } from '../../hooks/use-service';
import DatePicker from 'react-native-date-picker';
import Realm from 'realm';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { saveImages } from '../../utils/image-storage';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from '../../utils/permissions';
import { SERVICE_ITEM_TYPES } from '../../constants/service';

export default function ServiceScreen({ navigation, route }) {
  const { createService } = useService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeItemPicker, setActiveItemPicker] = useState(null);
  const [receiptPhotos, setReceiptPhotos] = useState([]);

  // Motorcycle info from route params (read-only)
  const motorcycleId = route?.params?.motorcycleId;
  const motorcycleName = route?.params?.motorcycleName || '';
  const motorcyclePlate = route?.params?.motorcyclePlate || '';

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      serviceDate: new Date(),
      workshop: '',
      odometerAtService: '',
      notes: '',
      items: [{ type: '', description: '', price: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');

  // Calculate total from all items — computed on every render
  // so the total updates live as the user types a price
  const total = (watchedItems || []).reduce((sum, item) => {
    const price = Number(item?.price) || 0;
    return sum + price;
  }, 0);

  const formatDate = date => {
    if (!date) {
      return '';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = amount => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const showReceiptPhotoOptions = () => {
    Alert.alert('Add Receipt Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => takeReceiptPhoto(),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => pickFromGallery(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const takeReceiptPhoto = async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });

      if (!result.didCancel && result.assets) {
        setReceiptPhotos(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('[ServiceScreen] takeReceiptPhoto failed:', error);
    }
  };

  const pickFromGallery = async () => {
    const granted = await requestPhotoLibraryPermission();
    if (!granted) {
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 5,
      });

      if (!result.didCancel && result.assets) {
        setReceiptPhotos(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('[ServiceScreen] pickFromGallery failed:', error);
    }
  };

  const removePhoto = index => {
    setReceiptPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async data => {
    if (!motorcycleId) {
      Alert.alert('Error', 'No motorcycle selected');
      return;
    }

    // Validate at least one service item has a type
    const validItems = (data.items || []).filter(
      item => item.type && item.type.trim(),
    );
    if (validItems.length === 0) {
      Alert.alert('Error', 'Please add at least one service item');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save receipt photos to persistent local storage
      const savedPhotoPaths = await saveImages(receiptPhotos, 'receipt');

      // Build service type from items
      const serviceType = validItems.map(item => item.type).join(', ');

      const result = createService({
        motorcycleId: new Realm.BSON.ObjectId(motorcycleId),
        serviceType,
        serviceDate: data.serviceDate,
        odometerAtService: data.odometerAtService
          ? Number(data.odometerAtService)
          : 0,
        cost: total,
        workshop: data.workshop,
        notes: data.notes,
        items: validItems,
        receiptPhotos: savedPhotoPaths,
      });

      setIsSubmitting(false);

      if (result.success) {
        navigation.goBack();
      } else {
        Alert.alert('Failed to Save', result.error);
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save photos: ' + error.message);
    }
  };

  return (
    <Container styles={tw.style('')} edges={[]}>
      <SafeAreaView style={tw.style('flex-1')}>
        {/* Header */}
        <View style={tw.style('flex-row items-center mx-6 mb-4')}>
          <ChevronLeft
            onPress={() => navigation.goBack()}
            size={24}
            color={tw.color('white')}
          />
          <Text
            style={tw.style(
              'flex-1 ml-6 text-2xl font-montserratBold text-white',
            )}>
            Add Service
          </Text>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={tw.style('mx-6 mb-4')}>
            {/* ─── Motorcycle (Read-only) ────────────────────────────── */}
            <View style={tw.style('mb-4')}>
              <Text
                style={tw.style('text-white font-montserratBold text-base')}>
                Motorcycle
              </Text>
              <View
                style={tw.style(
                  'border border-darkGrey rounded-xl p-4 mt-2 opacity-60',
                )}>
                <Text style={tw.style('text-white font-montserrat text-base')}>
                  {motorcycleName}
                  {motorcyclePlate ? ` — ${motorcyclePlate}` : ''}
                </Text>
              </View>
            </View>

            {/* ─── Service Date ─────────────────────────────────────── */}
            <Controller
              control={control}
              name="serviceDate"
              rules={{ required: 'Service date is required' }}
              render={({ field: { value } }) => (
                <View style={tw.style('mb-4')}>
                  <Text
                    style={tw.style(
                      'text-white font-montserratBold text-base',
                    )}>
                    Service Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={tw.style(
                      'flex-row items-center border border-darkGrey rounded-xl p-4 mt-2',
                    )}>
                    <Calendar
                      size={16}
                      color={tw.color('darkGrey')}
                      style={tw.style('mr-3')}
                    />
                    <Text
                      style={tw.style('text-white font-montserrat text-base')}>
                      {formatDate(value)}
                    </Text>
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    open={showDatePicker}
                    date={value || new Date()}
                    mode="date"
                    maximumDate={new Date()}
                    theme="dark"
                    onConfirm={date => {
                      setShowDatePicker(false);
                      setValue('serviceDate', date);
                    }}
                    onCancel={() => setShowDatePicker(false)}
                  />
                </View>
              )}
            />

            {/* ─── Workshop Name ────────────────────────────────────── */}
            <Controller
              control={control}
              name="workshop"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Workshop Name"
                  placeholder="Where did you service?"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            {/* ─── ODO Reading ──────────────────────────────────────── */}
            <Controller
              control={control}
              name="odometerAtService"
              rules={{
                validate: val => {
                  if (val && isNaN(Number(val))) {
                    return 'Must be a valid number';
                  }
                  if (val && Number(val) < 0) {
                    return 'Cannot be negative';
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={tw.style('mb-4')}>
                  <Text
                    style={tw.style(
                      'text-white font-montserratBold text-base',
                    )}>
                    ODO Reading (km)
                  </Text>
                  <View
                    style={tw.style(
                      'flex-row items-center border rounded-xl mt-2',
                      errors.odometerAtService
                        ? 'border-red-500'
                        : 'border-darkGrey',
                    )}>
                    <View style={tw.style('pl-4')}>
                      <Gauge size={16} color={tw.color('darkGrey')} />
                    </View>
                    <Input
                      placeholder="e.g., 2000"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      containerStyles="flex-1 mb-0"
                      textInputStyles="border-0"
                    />
                  </View>
                  {errors.odometerAtService && (
                    <Text
                      style={tw.style(
                        'text-red-500 font-montserrat text-xs mt-1',
                      )}>
                      {errors.odometerAtService.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* ─── Service Items ────────────────────────────────────── */}
          <View style={tw.style('mx-6 mb-4')}>
            <View
              style={tw.style('flex-row items-center justify-between mb-3')}>
              <Text
                style={tw.style('text-white font-montserratBold text-base')}>
                Service Items
              </Text>
              <TouchableOpacity
                onPress={() => append({ type: '', description: '', price: '' })}
                style={tw.style('flex-row items-center')}>
                <Plus size={16} color={tw.color('white')} />
                <Text
                  style={tw.style(
                    'text-white font-montserratBold text-sm ml-1',
                  )}>
                  Add Item
                </Text>
              </TouchableOpacity>
            </View>

            {fields.map((field, index) => (
              <View
                key={field.id}
                style={tw.style(
                  'bg-secondary border border-darkGrey rounded-xl mb-3 overflow-hidden',
                )}>
                {/* Item header */}
                <View
                  style={tw.style(
                    'flex-row items-center justify-between px-4 pt-3 pb-1',
                  )}>
                  <Text
                    style={tw.style('text-darkGrey font-montserrat text-xs')}>
                    Item {index + 1}
                  </Text>
                  {fields.length > 1 && (
                    <TouchableOpacity
                      onPress={() => remove(index)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <X size={14} color={tw.color('darkGrey')} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Service type dropdown */}
                <Controller
                  control={control}
                  name={`items.${index}.type`}
                  rules={{ required: 'Select a service type' }}
                  render={({ field: { value } }) => (
                    <View>
                      <TouchableOpacity
                        onPress={() =>
                          setActiveItemPicker(
                            activeItemPicker === index ? null : index,
                          )
                        }
                        style={tw.style(
                          'flex-row items-center justify-between px-4 py-3 border-b border-darkGrey',
                        )}>
                        <Text
                          style={tw.style(
                            value
                              ? 'text-white font-montserrat text-base'
                              : 'text-grey font-montserrat text-base',
                          )}>
                          {value || 'Select item type'}
                        </Text>
                        <ChevronDown size={16} color={tw.color('darkGrey')} />
                      </TouchableOpacity>
                      {activeItemPicker === index && (
                        <View style={tw.style('border-b border-darkGrey')}>
                          <ScrollView
                            style={tw.style('max-h-48')}
                            nestedScrollEnabled>
                            {SERVICE_ITEM_TYPES.map(type => (
                              <TouchableOpacity
                                key={type}
                                onPress={() => {
                                  setValue(`items.${index}.type`, type, {
                                    shouldValidate: true,
                                  });
                                  setActiveItemPicker(null);
                                }}
                                style={tw.style(
                                  'px-4 py-3 border-b border-darkGrey',
                                )}>
                                <Text
                                  style={tw.style(
                                    'text-white font-montserrat text-sm',
                                  )}>
                                  {type}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  )}
                />

                {/* Description */}
                <Controller
                  control={control}
                  name={`items.${index}.description`}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="Description (optional)"
                      value={value}
                      onChangeText={onChange}
                      containerStyles="mb-0 px-0"
                      textInputStyles="border-0 border-b border-darkGrey rounded-none"
                    />
                  )}
                />

                {/* Price */}
                <Controller
                  control={control}
                  name={`items.${index}.price`}
                  render={({ field: { onChange, value } }) => (
                    <View style={tw.style('flex-row items-center px-4 py-3')}>
                      <Text
                        style={tw.style(
                          'text-darkGrey font-montserrat text-base mr-2',
                        )}>
                        Rp
                      </Text>
                      <Input
                        placeholder="Price"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numeric"
                        containerStyles="flex-1 mb-0"
                        textInputStyles="border-0 p-0"
                      />
                    </View>
                  )}
                />
              </View>
            ))}
          </View>

          {/* ─── Total ───────────────────────────────────────────── */}
          <View
            style={tw.style(
              'mx-6 flex-row items-center justify-between mb-6 py-2',
            )}>
            <Text style={tw.style('text-white font-montserratBold text-base')}>
              Total
            </Text>
            <Text
              style={tw.style('text-primary font-montserratBold text-base')}>
              {formatCurrency(total)}
            </Text>
          </View>

          {/* ─── Notes ───────────────────────────────────────────── */}
          <View style={tw.style('mx-6 mb-4')}>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Notes (optional)"
                  placeholder="Any additional notes..."
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  textInputStyles="h-28"
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          {/* ─── Receipt Photos ───────────────────────────────────── */}
          <View style={tw.style('mx-6 mb-8')}>
            <Text
              style={tw.style('text-white font-montserratBold text-base mb-3')}>
              Receipt Photos
            </Text>
            <View style={tw.style('flex-row flex-wrap')}>
              {receiptPhotos.map((photo, index) => (
                <View key={index} style={tw.style('mr-3 mb-3 relative')}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={tw.style('w-20 h-20 rounded-xl')}
                  />
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    style={tw.style(
                      'absolute -top-2 -right-2 bg-dark rounded-full w-5 h-5 items-center justify-center border border-darkGrey',
                    )}>
                    <X size={10} color={tw.color('white')} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Photo Button */}
              <TouchableOpacity
                onPress={showReceiptPhotoOptions}
                style={tw.style(
                  'w-20 h-20 border border-darkGrey border-dashed rounded-xl items-center justify-center',
                )}>
                <Camera size={20} color={tw.color('darkGrey')} />
                <Text
                  style={tw.style(
                    'text-darkGrey font-montserrat text-xs mt-1',
                  )}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Buttons — Cancel + Save Service */}
        <View style={tw.style('flex-row items-center mx-6 mb-6 mt-2')}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw.style(
              'flex-1 p-4 rounded-xl items-center border border-darkGrey mr-3',
            )}>
            <Text style={tw.style('text-white font-montserratBold text-base')}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={tw.style(
              'flex-2 p-4 rounded-xl items-center',
              isSubmitting ? 'bg-gray-500' : 'bg-primary',
              { flex: 2 },
            )}>
            <Text style={tw.style('text-white font-montserratBold text-base')}>
              {isSubmitting ? 'Saving...' : 'Save Service'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Container>
  );
}
