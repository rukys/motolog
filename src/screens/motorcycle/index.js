import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import {Container, Input} from '../../components';
import tw from '../../../tailwind';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera, ChevronLeft, X} from 'lucide-react-native';
import {useForm, Controller} from 'react-hook-form';
import {useMotorcycle} from '../../hooks';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {saveImage} from '../../utils/image-storage';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from '../../utils/permissions';

export default function MotorcycleScreen({navigation}) {
  const {createMotorcycle} = useMotorcycle();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      name: '',
      model: '',
      plateNumber: '',
      currentOdoMeter: '',
    },
  });

  const showImageOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => openCamera(),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => openGallery(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const openCamera = async () => {
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

      if (!result.didCancel && result.assets?.[0]) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('[MotorcycleScreen] openCamera failed:', error);
    }
  };

  const openGallery = async () => {
    const granted = await requestPhotoLibraryPermission();
    if (!granted) {
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!result.didCancel && result.assets?.[0]) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('[MotorcycleScreen] openGallery failed:', error);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  const onSubmit = async formData => {
    setIsSubmitting(true);

    try {
      // Save photo to persistent local storage
      let imagePath = '';
      if (photo?.uri) {
        imagePath = await saveImage(photo.uri, 'motorcycle');
      }

      const result = createMotorcycle({
        name: formData.name,
        model: formData.model,
        plateNumber: formData.plateNumber,
        currentOdoMeter: Number(formData.currentOdoMeter),
        image: imagePath,
      });

      setIsSubmitting(false);

      if (result.success) {
        navigation.goBack();
      } else {
        Alert.alert('Failed to Save', result.error);
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save photo: ' + error.message);
    }
  };

  return (
    <Container styles={tw.style('')} edges={[]}>
      <SafeAreaView style={tw.style('flex-1')}>
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
            Add Motorcycle
          </Text>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Photo Section */}
          <View style={tw.style('mx-6 mb-8 mt-4')}>
            {photo ? (
              <View style={tw.style('self-center relative')}>
                <Image
                  source={{uri: photo.uri}}
                  style={tw.style('w-40 h-40 rounded-xl')}
                  resizeMode="cover"
                />
                {/* Remove button */}
                <TouchableOpacity
                  onPress={removePhoto}
                  style={tw.style(
                    'absolute -top-2 -right-2 bg-dark rounded-full w-7 h-7 items-center justify-center border border-darkGrey',
                  )}>
                  <X size={14} color={tw.color('white')} />
                </TouchableOpacity>
                {/* Change photo */}
                <TouchableOpacity
                  onPress={showImageOptions}
                  style={tw.style(
                    'absolute bottom-2 right-2 bg-primary rounded-full w-8 h-8 items-center justify-center',
                  )}>
                  <Camera size={14} color={tw.color('white')} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={showImageOptions}
                style={tw.style(
                  'self-center bg-secondary p-8 border border-darkGrey border-dashed rounded-xl items-center',
                )}>
                <Camera size={48} color={tw.color('grey')} />
                <Text
                  style={tw.style(
                    'text-grey font-montserrat text-sm mt-2',
                  )}>
                  Add Photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={tw.style('mx-6 mb-8')}>
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Name is required',
              }}
              render={({field: {onChange, value}}) => (
                <Input
                  label="Name"
                  placeholder="e.g., My Yamaha"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="model"
              rules={{
                required: 'Model is required',
              }}
              render={({field: {onChange, value}}) => (
                <Input
                  label="Model"
                  placeholder="e.g., Yamaha YZF-R1"
                  value={value}
                  onChangeText={onChange}
                  error={errors.model?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="plateNumber"
              rules={{
                required: 'Plate number is required',
              }}
              render={({field: {onChange, value}}) => (
                <Input
                  label="Plate Number"
                  placeholder="e.g., B 1234 XYZ"
                  value={value}
                  onChangeText={text => onChange(text.toUpperCase())}
                  autoCapitalize="characters"
                  error={errors.plateNumber?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="currentOdoMeter"
              rules={{
                required: 'Odometer is required',
                validate: inputValue => {
                  const numericValue = Number(inputValue);
                  if (isNaN(numericValue)) {
                    return 'Must be a valid number';
                  }
                  if (numericValue < 0) {
                    return 'Cannot be negative';
                  }
                  return true;
                },
              }}
              render={({field: {onChange, value}}) => (
                <Input
                  label="Current Odo Meter (KM)"
                  placeholder="e.g., 15000"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.currentOdoMeter?.message}
                />
              )}
            />
          </View>
        </ScrollView>

        <View style={tw.style('mx-6 mb-8 mt-4')}>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={tw.style(
              'p-4 rounded-xl items-center',
              isSubmitting ? 'bg-gray-500' : 'bg-primary',
            )}>
            <Text style={tw.style('text-white font-montserratBold text-base')}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Container>
  );
}
