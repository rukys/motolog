import React from 'react';
import {
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import tw from '../../../tailwind';
import { Container, Slider } from '../../components';
import { Bell, Clock4, Info, Route, ArrowLeft } from 'lucide-react-native';
import useGlobalStore from '../../stores/global';
import { useQuery } from '@realm/react';
import { Motorcycle } from '../../models/motorcycle';
import {
  requestNotificationPermission,
  cancelAllReminders,
} from '../../utils/notifications';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations';

type Props = StackScreenProps<RootStackParamList, 'ReminderSettingsScreen'>;

export default function ReminderSettingsScreen({ navigation }: Props) {
  const {
    isReminderEnabled,
    setIsReminderEnabled,
    isDistanceReminderEnabled,
    setIsDistanceReminderEnabled,
    distanceInterval,
    setDistanceInterval,
    isTimeReminderEnabled,
    setIsTimeReminderEnabled,
    timeInterval,
    setTimeInterval,
  } = useGlobalStore();

  const motorcycles = useQuery(Motorcycle);

  const toggleMaster = async () => {
    if (!isReminderEnabled && motorcycles.length === 0) {
      Alert.alert(
        'Belum Ada Motor',
        'Tambahkan motor di tab Garage terlebih dahulu untuk mengaktifkan pengingat.',
      );
      return;
    }

    const newReminderState = !isReminderEnabled;
    setIsReminderEnabled(newReminderState);
    if (newReminderState) {
      await requestNotificationPermission();
    } else {
      await cancelAllReminders();
    }
  };
  const toggleDistance = () =>
    setIsDistanceReminderEnabled(!isDistanceReminderEnabled);
  const toggleTime = () => setIsTimeReminderEnabled(!isTimeReminderEnabled);

  return (
    <Container>
      <View style={tw.style('flex-row items-center mx-6 mb-8')}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw.style('p-2 bg-secondary rounded-full mr-4')}>
          <ArrowLeft size={24} color={tw.color('white')} />
        </TouchableOpacity>
        <View style={tw.style('flex-1')}>
          <Text style={tw.style('text-2xl font-montserratBold text-white')}>
            Settings
          </Text>
          <Text style={tw.style('text-sm font-montserrat text-darkGrey')}>
            Never miss a service again
          </Text>
        </View>
      </View>

      <ScrollView>
        <View style={tw.style('mb-6')}>
          <View
            style={tw.style(
              'flex-row items-center mx-6 mb-6 p-6 rounded-xl border border-white',
            )}>
            <View style={tw.style('bg-primarySoft p-3 rounded-full mr-4')}>
              <Bell size={18} color={tw.color('primary')} />
            </View>
            <View style={tw.style('flex-1 mr-4')}>
              <Text
                style={tw.style('text-white font-montserratBold text-base')}>
                Enable reminders
              </Text>
              <Text style={tw.style('text-darkGrey font-montserrat text-sm')}>
                Get notified when service is due
              </Text>
            </View>
            <Switch
              value={isReminderEnabled}
              onValueChange={toggleMaster}
              trackColor={{
                false: tw.color('primarySoft') as string,
                true: tw.color('primary') as string,
              }}
              thumbColor={tw.color('dark') as string}
            />
          </View>

          <View
            style={tw.style('mx-6 p-6 rounded-xl border border-white mb-6')}>
            <View style={tw.style('flex-row items-center mb-2')}>
              <Route
                size={18}
                color={tw.color('primary')}
                style={tw.style('mr-4')}
              />
              <Text
                style={tw.style(
                  'flex-1 text-white font-montserratBold text-base',
                )}>
                Distance Interval
              </Text>
              <Switch
                value={isDistanceReminderEnabled}
                onValueChange={toggleDistance}
                disabled={motorcycles.length === 0}
                trackColor={{
                  false: tw.color('primarySoft') as string,
                  true: tw.color('primary') as string,
                }}
                thumbColor={tw.color('dark') as string}
              />
            </View>
            <View>
              <Text
                style={tw.style(
                  motorcycles.length === 0
                    ? 'text-darkGrey/50 font-montserrat'
                    : 'text-darkGrey font-montserrat',
                )}>
                Remind me every {distanceInterval.toLocaleString('id-ID')} KM
              </Text>
            </View>
            <Slider
              min={2000}
              max={10000}
              step={2000}
              stepLabel="k"
              initialValue={distanceInterval}
              formatLabel={sliderValue => (sliderValue / 1000).toString()}
              disabled={motorcycles.length === 0}
              onChange={value => setDistanceInterval(value)}
            />
          </View>

          <View style={tw.style('mx-6 p-6 rounded-xl border border-white')}>
            <View style={tw.style('flex-row items-center mb-2')}>
              <Clock4
                size={18}
                color={tw.color('primary')}
                style={tw.style('mr-4')}
              />
              <Text
                style={tw.style(
                  'flex-1 text-white font-montserratBold text-base',
                )}>
                Time Interval
              </Text>
              <Switch
                value={isTimeReminderEnabled}
                onValueChange={toggleTime}
                disabled={motorcycles.length === 0}
                trackColor={{
                  false: tw.color('primarySoft') as string,
                  true: tw.color('primary') as string,
                }}
                thumbColor={tw.color('dark') as string}
              />
            </View>
            <View>
              <Text
                style={tw.style(
                  motorcycles.length === 0
                    ? 'text-darkGrey/50 font-montserrat'
                    : 'text-darkGrey font-montserrat',
                )}>
                Remind me every {timeInterval} months
              </Text>
            </View>
            <Slider
              min={2}
              max={12}
              step={2}
              stepLabel="Mo"
              initialValue={timeInterval}
              formatLabel={sliderValue => sliderValue.toString()}
              disabled={motorcycles.length === 0}
              onChange={value => setTimeInterval(value)}
            />
          </View>
        </View>

        <View
          style={tw.style(
            'flex-row items-center mx-6 p-6 mb-6 rounded-xl bg-secondary',
          )}>
          <Info
            size={18}
            color={tw.color('darkGrey')}
            style={tw.style('mr-4')}
          />
          <Text style={tw.style('flex-1 text-white font-montserrat text-base')}>
            Reminders are calculated based on your last service record and
            current ODO reading. {'\n'}
            {'\n'}Make sure to keep your ODO reading updated for accurate
            estimations!
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
