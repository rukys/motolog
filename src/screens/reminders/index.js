import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import tw from '../../../tailwind';
import { Container, EmptyState } from '../../components';
import {
  Settings,
  BellRing,
  Info,
  Bell,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import {
  useReminder,
  useMotorcycle,
  useService,
  usePartsHealth,
} from '../../hooks';
import { globalStore } from '../../stores';

export default function ReminderListScreen({ navigation }) {
  const { reminders, markAsCompleted } = useReminder();
  const { motorcycles } = useMotorcycle();
  const { services } = useService();
  const { selectedMotorcycleId } = globalStore();

  const activeMotorcycle =
    motorcycles.find(m => m._id.toHexString() === selectedMotorcycleId) ||
    motorcycles[0];

  const activeServices = services.filter(
    s => s.motorcycleId?.toHexString() === activeMotorcycle?._id?.toHexString(),
  );

  const partsHealth = usePartsHealth(
    activeServices,
    activeMotorcycle?.currentOdoMeter || 0,
  );

  // Combine Realm reminders and computed PartsHealth predictions
  const activeReminders = reminders.filter(
    r =>
      r.status !== 'COMPLETED' &&
      r.motorcycleId?.toHexString() === activeMotorcycle?._id?.toHexString(),
  );

  const pendingReminders = activeReminders.filter(r => r.status === 'PENDING');
  const triggeredReminders = activeReminders.filter(r => r.status === 'TRIGGERED');

  // Inject Parts Health Predicitons
  partsHealth.forEach(part => {
    if (part.hasRecord) {
      const predictedReminder = {
        _id: { toHexString: () => `virtual-${part.id}` },
        title: `Ganti ${part.label}`,
        body:
          part.remaining > 0
            ? `Estimasi lifespan ${
                part.label
              } tinggal ${part.remaining.toLocaleString('id-ID')} KM lagi.`
            : `Waktunya ganti ${part.label}! Udah lewat ${Math.abs(
                part.remaining,
              ).toLocaleString('id-ID')} KM.`,
        expectedValue:
          part.remaining > 0
            ? activeMotorcycle.currentOdoMeter + part.remaining
            : null,
        isVirtual: true,
      };

      if (part.healthPercent < 15) {
        triggeredReminders.push(predictedReminder);
      } else if (part.healthPercent < 40) {
        pendingReminders.push(predictedReminder);
      }
    }
  });

  const renderReminderCard = (reminder, isTriggered = false) => {
    return (
      <View
        key={reminder._id.toHexString()}
        style={tw.style(
          'p-5 mb-4 rounded-xl border',
          isTriggered
            ? 'bg-error/10 border-error/30'
            : 'bg-secondary border-white/10',
        )}>
        <View style={tw.style('flex-row items-start justify-between')}>
          <View style={tw.style('bg-primarySoft p-2.5 rounded-lg mr-4')}>
            {reminder.isVirtual ? (
              <Sparkles size={20} color={tw.color('primary')} />
            ) : isTriggered ? (
              <BellRing size={20} color={tw.color('error')} />
            ) : (
              <Bell size={20} color={tw.color('primary')} />
            )}
          </View>
          <View style={tw.style('flex-1 mr-2')}>
            <Text
              style={tw.style('text-white font-montserratBold text-base mb-1')}>
              {reminder.title}
            </Text>
            <Text
              style={tw.style(
                'text-white/70 font-montserrat text-sm leading-5',
              )}>
              {reminder.body}
            </Text>

            {reminder.expectedDate || reminder.expectedValue ? (
              <View
                style={tw.style(
                  'mt-3 bg-dark/50 self-start px-3 py-1.5 rounded-full',
                )}>
                <Text
                  style={tw.style('text-primary font-montserratBold text-xs')}>
                  {reminder.expectedDate
                    ? new Date(reminder.expectedDate).toLocaleDateString(
                        'id-ID',
                      )
                    : `at ${reminder.expectedValue.toLocaleString('id-ID')} KM`}
                </Text>
              </View>
            ) : null}
          </View>

          {isTriggered && !reminder.isVirtual && (
            <TouchableOpacity
              onPress={() => markAsCompleted(reminder._id.toHexString())}
              style={tw.style('p-2')}>
              <CheckCircle2 size={24} color={tw.color('primary')} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Container edges={['top']}>
      <View
        style={tw.style(
          'flex-row items-center justify-between mx-6 mb-6 mt-4',
        )}>
        <View style={tw.style('flex-1')}>
          <Text style={tw.style('text-2xl font-montserratBold text-white')}>
            Reminders
          </Text>
          <Text style={tw.style('text-sm font-montserrat text-darkGrey')}>
            {activeMotorcycle ? activeMotorcycle.name : 'Your scheduled alerts'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ReminderSettingsScreen')}
          style={tw.style('p-2 bg-secondary rounded-full')}>
          <Settings size={22} color={tw.color('white')} />
        </TouchableOpacity>
      </View>

      {!activeMotorcycle ? (
        <View style={tw.style('flex-1 justify-center')}>
          <EmptyState
            icon={Bell}
            iconColor={tw.color('primary')}
            title="No Motorcycle Selected"
            description="Please add or select a motorcycle in the Garage to view its reminders"
          />
        </View>
      ) : activeReminders.length === 0 ? (
        <ScrollView
          contentContainerStyle={tw.style('flex-grow justify-center pb-20')}>
          <EmptyState
            icon={BellRing}
            iconColor={tw.color('primary')}
            title="All Caught Up!"
            description="You don't have any active warnings or scheduled reminders for this motorcycle right now."
            buttonText="Configure Settings"
            buttonIcon={Settings}
            buttonStyle={tw.style('bg-primary')}
            onPressButton={() => navigation.navigate('ReminderSettingsScreen')}
          />
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw.style('px-6 pb-24')}>
          {triggeredReminders.length > 0 && (
            <View style={tw.style('mb-6')}>
              <Text
                style={tw.style(
                  'text-error font-montserratBold text-sm uppercase tracking-wider mb-3',
                )}>
                Needs Attention
              </Text>
              {triggeredReminders.map(r => renderReminderCard(r, true))}
            </View>
          )}

          {pendingReminders.length > 0 && (
            <View style={tw.style('mb-4')}>
              <Text
                style={tw.style(
                  'text-darkGrey font-montserratBold text-sm uppercase tracking-wider mb-3',
                )}>
                Upcoming
              </Text>
              {pendingReminders.map(r => renderReminderCard(r, false))}
            </View>
          )}

          <View
            style={tw.style(
              'flex-row items-center p-4 mt-2 rounded-xl bg-secondary/50',
            )}>
            <Info
              size={20}
              color={tw.color('darkGrey')}
              style={tw.style('mr-3')}
            />
            <Text
              style={tw.style('flex-1 text-darkGrey font-montserrat text-xs')}>
              Reminders are automatically generated based on your settings and
              parts health analysis.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Floating Action Button - AI */}
      <TouchableOpacity
        onPress={() => navigation.navigate('MotoAIScreen')}
        activeOpacity={0.8}
        style={tw.style(
          'absolute bottom-6 right-6 bg-secondary w-14 h-14 rounded-full items-center justify-center border border-primary/50',
          {
            shadowColor: '#ff6600',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          },
        )}>
        <Sparkles size={26} color={tw.color('primary')} />
      </TouchableOpacity>
    </Container>
  );
}
