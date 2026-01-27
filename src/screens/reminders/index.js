import React from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import tw from '../../../tailwind';
import { Container } from '../../components';
import { Bell, Clock4, Info, Route } from 'lucide-react-native';

export default function RemindersScreen() {
  const [isReminderEnabled, setIsReminderEnabled] = React.useState(true);
  const [distanceInterval, setDistanceInterval] = React.useState(true);
  const [timeInterval, setTimeInterval] = React.useState(true);

  const enableReminders = () => {
    setIsReminderEnabled(!isReminderEnabled);
    setDistanceInterval(!distanceInterval);
    setTimeInterval(!timeInterval);
  };

  const enableDistanceInterval = () => {
    setDistanceInterval(!distanceInterval);
  };

  const enableTimeInterval = () => {
    setTimeInterval(!timeInterval);
  };

  return (
    <Container>
      <View style={tw.style('flex-row items-center mx-6 mb-8')}>
        <View style={tw.style('flex-1')}>
          <Text style={tw.style('text-2xl font-montserratBold text-white')}>
            Reminders
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
              onValueChange={enableReminders}
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
                value={distanceInterval}
                onValueChange={enableDistanceInterval}
                trackColor={{
                  false: tw.color('primarySoft'),
                  true: tw.color('primary'),
                }}
                thumbColor={tw.color('dark')}
              />
            </View>
            <View>
              <Text style={tw.style('text-darkGrey font-montserrat text-md')}>
                Remind me every 2,000 KM
              </Text>
            </View>
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
                value={timeInterval}
                onValueChange={enableTimeInterval}
                trackColor={{
                  false: tw.color('primarySoft'),
                  true: tw.color('primary'),
                }}
                thumbColor={tw.color('dark')}
              />
            </View>
            <View>
              <Text style={tw.style('text-darkGrey font-montserrat text-md')}>
                Remind me every 3 months
              </Text>
            </View>
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
