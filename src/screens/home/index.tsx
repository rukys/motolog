import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  Container,
  EmptyState,
  MotorcycleSelector,
  ServiceInfoCard,
  ServiceCard,
  PartsHealthCard,
} from '../../components';
import tw from '../../../tailwind';
import { useMotorcycle, useService } from '../../hooks';
import useGlobalStore from '../../stores/global';
import {
  Wrench,
  Clock,
  TrendingUp,
  Plus,
  Bike,
  AlertTriangle,
  Sparkles,
} from 'lucide-react-native';
import Realm from 'realm';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, MainTabParamList } from '../../navigations';
import { Service } from '../../models/service';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeScreen'>,
  StackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { motorcycles, motorcycleCount, updateOdometer } = useMotorcycle();
  const { services } = useService();
  const { selectedMotorcycleId, setSelectedMotorcycleId } = useGlobalStore();

  const activeMotorcycle =
    motorcycles.find(
      motorcycle => motorcycle._id.toHexString() === selectedMotorcycleId,
    ) || motorcycles[0];

  const activeServices = React.useMemo(() => {
    if (!activeMotorcycle) {
      return [];
    }
    return services.filter(
      serviceRecord =>
        serviceRecord.motorcycleId?.toHexString() ===
        activeMotorcycle._id.toHexString(),
    );
  }, [services, activeMotorcycle]);

  const lastService = activeServices.length > 0 ? activeServices[0] : null;
  const totalExpense = activeServices.reduce(
    (sum, serviceRecord) => sum + (serviceRecord.cost || 0),
    0,
  );

  const getNextServiceEstimation = (service: Service | null) => {
    if (!service) {
      return null;
    }

    let nextServiceDate = null;
    if (service.serviceDate) {
      nextServiceDate = new Date(service.serviceDate);
      nextServiceDate.setMonth(nextServiceDate.getMonth() + 2);
    }

    let nextServiceOdo = null;
    if (
      typeof service.odometerAtService === 'number' &&
      service.odometerAtService > 0
    ) {
      nextServiceOdo = service.odometerAtService + 2000;
    }

    return { nextServiceDate, nextServiceOdo };
  };

  const nextServiceInfo = getNextServiceEstimation(lastService);
  const isServiceDue =
    nextServiceInfo &&
    nextServiceInfo.nextServiceDate &&
    new Date() >= nextServiceInfo.nextServiceDate;

  const calculateAverageExpense = () => {
    if (!totalExpense || !activeMotorcycle?.createdAt) {
      return 0;
    }
    const addedDate = new Date(activeMotorcycle.createdAt);
    const now = new Date();
    let monthsDiff =
      (now.getFullYear() - addedDate.getFullYear()) * 12 +
      (now.getMonth() - addedDate.getMonth());
    if (monthsDiff < 1) {
      monthsDiff = 1;
    }
    return totalExpense / monthsDiff;
  };

  const averageMonthlyExpense = calculateAverageExpense();
  const recentServices = activeServices.slice(0, 2);

  const formatCurrency = (amount: number) => {
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) {
      return '';
    }
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (motorcycleCount === 0) {
    return (
      <Container styles={tw.style('items-center justify-center')} edges={[]}>
        <EmptyState
          icon={Bike}
          iconColor={tw.color('primary')}
          title="Your Garage is Empty"
          description="Add your first motorcycle to start tracking service history and expenses"
          buttonText="Add Motorcycle"
          buttonIcon={Plus}
          buttonStyle={tw.style('bg-primary')}
          onPressButton={() => navigation.navigate('MotorcycleScreen')}
        />
      </Container>
    );
  }

  return (
    <Container edges={[]}>
      <View style={tw.style('mt-14 mb-6')}>
        <MotorcycleSelector
          motorcycles={motorcycles as any}
          activeMotorcycleId={activeMotorcycle?._id?.toHexString()}
          onSelect={selectedMotorcycle => {
            setSelectedMotorcycleId(selectedMotorcycle._id.toHexString());
            Alert.alert(
              'Motor Berhasil Diganti',
              `Sekarang menampilkan data untuk ${selectedMotorcycle.name}`,
              [{ text: 'OK' }],
              { cancelable: true },
            );
          }}
          onEditOdo={(motorcycleIdHex, newOdometer) => {
            updateOdometer(
              new Realm.BSON.ObjectId(motorcycleIdHex),
              newOdometer,
            );
          }}
        />
      </View>

      {isServiceDue && (
        <View style={tw.style('mx-6 mb-6')}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('ServiceScreen', {
                motorcycleId: activeMotorcycle?._id?.toHexString() || '',
                motorcycleName: activeMotorcycle?.name || '',
                motorcyclePlate: activeMotorcycle?.plateNumber || '',
              })
            }
            style={tw.style(
              'bg-error/20 border border-error/50 flex-row items-center p-4 rounded-xl',
            )}>
            <AlertTriangle size={24} color={tw.color('error')} />
            <View style={tw.style('ml-3 flex-1')}>
              <Text
                style={tw.style('text-error font-montserratBold text-sm mb-1')}>
                Time for Service!
              </Text>
              <Text style={tw.style('text-white/80 font-montserrat text-xs')}>
                Your motorcycle has reached its service limits. Tap to log now.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw.style('px-6 pb-24')}>
        <ServiceInfoCard
          icon={<Wrench size={20} color={tw.color('primary')} />}
          title="Last Service">
          <View style={tw.style('items-center py-4')}>
            {lastService ? (
              <>
                <Text
                  style={tw.style(
                    'text-white font-montserratBold text-lg mb-1',
                  )}>
                  {formatDate(lastService.serviceDate)}
                </Text>
                <Text style={tw.style('text-white font-montserrat text-sm')}>
                  {lastService.serviceType}{' '}
                  {lastService.odometerAtService
                    ? `- ${lastService.odometerAtService} KM`
                    : ''}
                </Text>
                {lastService.workshop ? (
                  <Text
                    style={tw.style(
                      'text-primary font-montserrat text-xs mt-1.5',
                    )}>
                    📍 {lastService.workshop}
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                <Text
                  style={tw.style('text-grey font-montserrat text-base mb-1')}>
                  No service records yet
                </Text>
                <Text style={tw.style('text-darkGrey font-montserrat text-sm')}>
                  Add your first service to start tracking
                </Text>
              </>
            )}
          </View>
        </ServiceInfoCard>

        <ServiceInfoCard
          icon={
            <Clock
              size={20}
              color={tw.color(isServiceDue ? 'error' : 'primary')}
            />
          }
          title="Next Service Estimation">
          <View style={tw.style('items-center py-4')}>
            {nextServiceInfo ? (
              <>
                <Text
                  style={tw.style(
                    `font-montserratBold text-lg mb-1 ${
                      isServiceDue ? 'text-error' : 'text-white'
                    }`,
                  )}>
                  {nextServiceInfo.nextServiceDate
                    ? formatDate(nextServiceInfo.nextServiceDate)
                    : '-'}
                </Text>
                <Text style={tw.style('text-white font-montserrat text-sm')}>
                  {nextServiceInfo.nextServiceOdo
                    ? `or at ${nextServiceInfo.nextServiceOdo.toLocaleString(
                        'id-ID',
                      )} KM`
                    : 'Time for periodic check'}
                </Text>
                {isServiceDue && (
                  <Text
                    style={tw.style(
                      'text-error font-montserratBold text-xs mt-2',
                    )}>
                    Service is due!
                  </Text>
                )}
              </>
            ) : (
              <Text
                style={tw.style('text-grey font-montserrat text-base mb-1')}>
                Add a service record to see estimates
              </Text>
            )}
          </View>
        </ServiceInfoCard>

        <PartsHealthCard
          services={activeServices as any}
          currentOdoMeter={activeMotorcycle?.currentOdoMeter || 0}
        />

        <ServiceInfoCard
          icon={<TrendingUp size={20} color={tw.color('primary')} />}
          title="Expense Breakdown">
          <View style={tw.style('items-center py-4')}>
            {totalExpense > 0 ? (
              <>
                <Text
                  style={tw.style(
                    'text-white font-montserratBold text-lg mb-1',
                  )}>
                  {formatCurrency(totalExpense)}
                </Text>
                <Text style={tw.style('text-white font-montserrat text-sm')}>
                  Total service expenses
                </Text>
                <View
                  style={tw.style(
                    'bg-secondary py-1.5 px-3 mt-3 rounded-full border border-darkGrey',
                  )}>
                  <Text
                    style={tw.style(
                      'text-primary font-montserratBold text-xs',
                    )}>
                    Avg. {formatCurrency(Math.floor(averageMonthlyExpense))} /
                    month
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text
                  style={tw.style('text-grey font-montserrat text-base mb-1')}>
                  No expenses recorded yet
                </Text>
                <Text style={tw.style('text-darkGrey font-montserrat text-sm')}>
                  Start logging services to see your spending breakdown
                </Text>
              </>
            )}
          </View>
        </ServiceInfoCard>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ServiceScreen', {
              motorcycleId: activeMotorcycle?._id?.toHexString() || '',
              motorcycleName: activeMotorcycle?.name || '',
              motorcyclePlate: activeMotorcycle?.plateNumber || '',
            })
          }
          activeOpacity={0.8}
          style={tw.style(
            'flex-row items-center justify-center bg-primary/10 border border-primary/30 p-4 rounded-xl mt-4 mx-1',
          )}>
          <Plus size={20} color={tw.color('primary')} />
          <Text style={tw.style('text-primary font-montserratBold ml-2')}>
            Log New Service
          </Text>
        </TouchableOpacity>

        {recentServices.length > 0 && (
          <View style={tw.style('mt-6')}>
            <Text
              style={tw.style(
                'text-white font-montserratBold text-lg mb-3 mx-1',
              )}>
              Recent Activity
            </Text>
            {recentServices.map(service => (
              <ServiceCard
                key={service._id.toHexString()}
                service={service as any}
                motorcycleName={activeMotorcycle?.name}
                onPress={() =>
                  navigation.navigate('ServiceDetailScreen', {
                    id: service._id.toHexString(),
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => navigation.navigate('MotoAIScreen')}
        activeOpacity={0.8}
        style={[
          tw.style(
            'absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center',
          ),
          {
            shadowColor: '#ff6600',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          },
        ]}>
        <Sparkles size={26} color={tw.color('white')} />
      </TouchableOpacity>
    </Container>
  );
}
