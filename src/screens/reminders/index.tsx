import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import tw from '../../../tailwind';
import { Container, EmptyState } from '../../components';
import {
  Settings,
  BellRing,
  Info,
  Bell,
  CheckCircle2,
  Sparkles,
  Trash2,
  Brain,
  User,
} from 'lucide-react-native';
import {
  useReminder,
  useMotorcycle,
  useService,
  usePartsHealth,
} from '../../hooks';
import useGlobalStore from '../../stores/global';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, MainTabParamList } from '../../navigations';
import { Reminder } from '../../models/reminder';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'RemindersScreen'>,
  StackScreenProps<RootStackParamList>
>;

const SHADOW_STYLE = {
  shadowColor: '#ff6600',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 8,
};

interface VirtualReminder {
  _id: { toHexString: () => string };
  title: string;
  body: string;
  expectedValue: number | null;
  expectedDate?: Date | string | null;
  isVirtual: boolean;
  status?: string;
  type?: string;
}

export default function ReminderListScreen({ navigation }: Props) {
  const { reminders, markAsCompleted, deleteReminder } = useReminder();
  const { motorcycles } = useMotorcycle();
  const { services } = useService();
  const { selectedMotorcycleId } = useGlobalStore();

  const activeMotorcycle =
    motorcycles.find(
      motorcycle => motorcycle._id.toHexString() === selectedMotorcycleId,
    ) || motorcycles[0];

  const activeServices = services.filter(
    serviceRecord =>
      serviceRecord.motorcycleId?.toHexString() ===
      activeMotorcycle?._id?.toHexString(),
  );

  const partsHealth = usePartsHealth(
    activeServices as any,
    activeMotorcycle?.currentOdoMeter || 0,
  );

  const activeReminders = reminders.filter(
    reminder =>
      reminder.status !== 'COMPLETED' &&
      reminder.motorcycleId?.toHexString() ===
        activeMotorcycle?._id?.toHexString(),
  );

  const pendingReminders: (Reminder | VirtualReminder)[] =
    activeReminders.filter(reminder => reminder.status === 'PENDING');
  const triggeredReminders: (Reminder | VirtualReminder)[] =
    activeReminders.filter(reminder => reminder.status === 'TRIGGERED');

  const handleDelete = (reminder: Reminder | VirtualReminder) => {
    if ('isVirtual' in reminder && reminder.isVirtual) {
      return;
    }

    Alert.alert(
      'Hapus Pengingat',
      `Apakah kamu yakin ingin menghapus pengingat "${reminder.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteReminder((reminder as Reminder)._id),
        },
      ],
    );
  };

  partsHealth.forEach(part => {
    if (part.hasRecord) {
      const predictedReminder: VirtualReminder = {
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
            ? (activeMotorcycle?.currentOdoMeter || 0) + part.remaining
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

  const renderReminderCard = (
    reminder: Reminder | VirtualReminder,
    isTriggered = false,
  ) => {
    const isVirtual = 'isVirtual' in reminder && reminder.isVirtual;
    const isAI =
      ('type' in reminder && reminder.type === 'AI_SUGGESTION') || isVirtual;

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
            {isVirtual ? (
              <Sparkles size={20} color={tw.color('primary')} />
            ) : isTriggered ? (
              <BellRing size={20} color={tw.color('error')} />
            ) : (
              <Bell size={20} color={tw.color('primary')} />
            )}
          </View>
          <View style={tw.style('flex-1 mr-2')}>
            <View style={tw.style('flex-row items-center mb-1')}>
              <Text
                style={tw.style(
                  'text-white font-montserratBold text-base flex-1',
                )}
                numberOfLines={1}>
                {reminder.title}
              </Text>
              <View
                style={tw.style(
                  'flex-row items-center px-2 py-0.5 rounded-md bg-dark/40',
                )}>
                {isAI ? (
                  <Brain size={10} color={tw.color('primary')} />
                ) : (
                  <User size={10} color={tw.color('grey')} />
                )}
                <Text
                  style={tw.style(
                    'text-[9px] font-montserratBold ml-1 uppercase',
                    isAI ? 'text-primary' : 'text-grey',
                  )}>
                  {isAI ? 'AI' : 'Manual'}
                </Text>
              </View>
            </View>

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
                    : `at ${reminder.expectedValue?.toLocaleString(
                        'id-ID',
                      )} KM`}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={tw.style('flex-row items-center')}>
            {isTriggered && !isVirtual && (
              <TouchableOpacity
                onPress={() => markAsCompleted(reminder._id.toHexString())}
                style={tw.style('p-2')}>
                <CheckCircle2 size={22} color={tw.color('primary')} />
              </TouchableOpacity>
            )}
            {!isVirtual && (
              <TouchableOpacity
                onPress={() => handleDelete(reminder)}
                style={tw.style('p-2')}>
                <Trash2 size={18} color={tw.color('error')} />
              </TouchableOpacity>
            )}
          </View>
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
          onPress={() =>
            navigation.navigate('ReminderSettingsScreen', {
              id: activeMotorcycle?._id.toHexString() || '',
            })
          }
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
      ) : triggeredReminders.length === 0 && pendingReminders.length === 0 ? (
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
            onPressButton={() =>
              navigation.navigate('ReminderSettingsScreen', {
                id: activeMotorcycle?._id.toHexString() || '',
              })
            }
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
              {triggeredReminders.map(reminder =>
                renderReminderCard(reminder, true),
              )}
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
              {pendingReminders.map(reminder =>
                renderReminderCard(reminder, false),
              )}
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

      <TouchableOpacity
        onPress={() => navigation.navigate('MotoAIScreen')}
        activeOpacity={0.8}
        style={[
          tw.style(
            'absolute bottom-6 right-6 bg-secondary w-14 h-14 rounded-full items-center justify-center border border-primary/50',
          ),
          SHADOW_STYLE,
        ]}>
        <Sparkles size={26} color={tw.color('primary')} />
      </TouchableOpacity>
    </Container>
  );
}
