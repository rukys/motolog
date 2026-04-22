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
import { globalStore } from '../../stores';
import { useQuery } from '@realm/react';
import { Motorcycle } from '../../models/motorcycle';
import {
  requestNotificationPermission,
  // sendTestNotification,
  cancelAllReminders,
} from '../../utils/notifications';

export default function ReminderSettingsScreen({ navigation }) {
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
  } = globalStore();

  const motorcycles = useQuery(Motorcycle);

  const toggleMaster = async () => {
    if (!isReminderEnabled && motorcycles.length === 0) {
      Alert.alert(
        'Belum Ada Motor',
        'Tambahkan motor di tab Garage terlebih dahulu untuk mengaktifkan pengingat.',
      );
      return;
    }

    const newVal = !isReminderEnabled;
    setIsReminderEnabled(newVal);
    if (newVal) {
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
                false: tw.color('primarySoft'),
                true: tw.color('primary'),
              }}
              thumbColor={tw.color('dark')}
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
                  false: tw.color('primarySoft'),
                  true: tw.color('primary'),
                }}
                thumbColor={tw.color('dark')}
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
              formatLabel={v => v / 1000}
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
                  false: tw.color('primarySoft'),
                  true: tw.color('primary'),
                }}
                thumbColor={tw.color('dark')}
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
              formatLabel={v => v}
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
        {/* <TouchableOpacity
          onPress={sendTestNotification}
          style={tw.style('mx-6 mb-8 p-4 rounded-xl items-center', {
             backgroundColor: tw.color('primary'),
             shadowColor: '#ff6600',
             shadowOffset: { width: 0, height: 4 },
             shadowOpacity: 0.3,
             shadowRadius: 6,
             elevation: 8,
          })}>
          <Text style={tw.style('text-white font-montserratBold text-base')}>
            Test Notification (5 sec delay)
          </Text>
        </TouchableOpacity> */}
      </ScrollView>
    </Container>
  );
}
