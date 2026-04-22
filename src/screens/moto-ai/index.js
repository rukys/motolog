import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import tw from '../../../tailwind';
import {
  Container,
  PartsHealthCard,
  ServiceCard,
  ExpenseAnalyticsCard,
  DiagnosticCard,
} from '../../components';
import {
  ArrowLeft,
  Send,
  Sparkles,
  AlertCircle,
  Edit3,
  ChevronRight,
  X,
  Check,
  Bike,
  Save,
} from 'lucide-react-native';
import { useAgent, useMotorcycle, useService } from '../../hooks';

const QuickLogCard = ({
  activeMotorcycle,
  serviceType,
  items = [],
  onSave,
}) => {
  const [costs, setCosts] = useState(
    items.reduce((acc, item, index) => {
      acc[index] = item.estimatedCost ? item.estimatedCost.toString() : '';
      return acc;
    }, {}),
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleCostChange = (index, value) => {
    setCosts(prev => ({ ...prev, [index]: value }));
  };

  const handleSave = () => {
    // Map the items to match ServiceScreen format
    const formattedItems = items.map((item, index) => ({
      type: item.category,
      description: 'Quick Log by AI',
      price: costs[index] ? parseInt(costs[index], 10) : 0,
    }));

    const totalCost = formattedItems.reduce((sum, item) => sum + item.price, 0);

    onSave(activeMotorcycle._id, serviceType, totalCost, formattedItems);
    setIsSaved(true);
  };

  return (
    <View
      style={tw.style(
        'mt-4 bg-dark border border-primary/30 rounded-xl overflow-hidden w-64',
      )}>
      <View style={tw.style('p-3 bg-primary/20')}>
        <Text style={tw.style('text-primary font-montserratBold text-sm')}>
          {serviceType}
        </Text>
      </View>
      <View style={tw.style('p-4 py-3')}>
        {items.map((item, index) => (
          <View key={index} style={tw.style('mb-3')}>
            <Text
              style={tw.style(
                'text-white font-montserratSemiBold text-xs mb-1',
              )}>
              {item.category}
            </Text>
            <Text
              style={tw.style(
                'text-white/60 font-montserrat text-[10px] mb-1',
              )}>
              Estimasi Biaya (Rp)
            </Text>
            <TextInput
              value={costs[index]}
              onChangeText={costValue => handleCostChange(index, costValue)}
              keyboardType="number-pad"
              editable={!isSaved}
              placeholder="0"
              placeholderTextColor={tw.color('white/20')}
              style={tw.style(
                'text-white font-montserratSemiBold text-sm border-b border-primary/50 pb-1',
              )}
            />
          </View>
        ))}

        <TouchableOpacity
          style={tw.style(
            `flex-row items-center justify-center p-2.5 rounded-lg mt-2 ${
              isSaved ? 'bg-secondary border border-darkGrey' : 'bg-primary'
            }`,
          )}
          disabled={isSaved}
          onPress={handleSave}>
          {isSaved ? (
            <Check size={16} color={tw.color('primary')} />
          ) : (
            <Save size={16} color={tw.color('white')} />
          )}
          <Text
            style={tw.style(
              `font-montserratBold ml-1.5 text-sm ${
                isSaved ? 'text-primary' : 'text-white'
              }`,
            )}>
            {isSaved ? 'Tersimpan!' : 'Simpan ke Rekap'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function MotoAIScreen({ navigation }) {
  const {
    messages,
    isLoading,
    sendMessage,
    activeMotorcycle,
    addSystemMessage,
  } = useAgent();
  const { updateOdometer } = useMotorcycle();
  const { createService } = useService();
  const { services } = useService();
  const [inputText, setInputText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempOdo, setTempOdo] = useState('');
  const scrollViewRef = useRef();

  const SUGGESTIONS = [
    'Kapan jadwal ganti oli kak?',
    'Ingetin servis CVT minggu depan',
    'Gejala kampas rem udah tipis',
    'Cek status motor saya sekarang',
  ];

  const handleSend = () => {
    if (!inputText.trim() || isLoading) {
      return;
    }
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleSaveOdo = () => {
    const odometerValue = parseInt(tempOdo, 10);
    if (isNaN(odometerValue) || odometerValue < 0) {
      Alert.alert('Invalid', 'Odometer must be a valid number.');
      return;
    }
    updateOdometer(activeMotorcycle._id, odometerValue);
    setIsModalVisible(false);

    // Inject visual feedback into chat
    if (addSystemMessage) {
      addSystemMessage(
        `Sip kak! Angka Odometer motor kamu udah saya update ke sistem jadi ${odometerValue.toLocaleString(
          'id-ID',
        )} KM. Cek rutin jadwal servis ya!`,
      );
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollViewRef.current) {
      setTimeout(
        () => scrollViewRef.current.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [messages, isLoading]);

  return (
    <Container edges={['top', 'bottom']}>
      {/* Header */}
      <View style={tw.style('flex-row items-center mx-6 mb-4')}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw.style('p-2 bg-secondary rounded-full mr-4')}>
          <ArrowLeft size={24} color={tw.color('white')} />
        </TouchableOpacity>
        <View style={tw.style('flex-row items-center')}>
          <Sparkles
            size={24}
            color={tw.color('primary')}
            style={tw.style('mr-2')}
          />
          <View>
            <Text style={tw.style('text-2xl font-montserratBold text-white')}>
              MotoAI
            </Text>
            <Text style={tw.style('text-xs font-montserrat text-primary')}>
              Agent for {activeMotorcycle?.name || 'Garage'}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={tw.style('flex-1')}
        behavior={Platform.OS === 'ios' ? 'padding' : null}>
        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw.style('px-6 pb-6 pt-2')}>
          {messages.length === 0 ? (
            <View style={tw.style('items-center justify-center py-20')}>
              <Sparkles
                size={48}
                color={tw.color('darkGrey')}
                style={tw.style('mb-4 opacity-50')}
              />
              <Text
                style={tw.style(
                  'text-darkGrey font-montserrat text-center px-8 mb-8',
                )}>
                Sapa MotoAI! Kamu bisa konsultasi servis, minta ingetin ganti
                part, atau cek status motor di sini.
              </Text>

              <View style={tw.style('flex-row flex-wrap justify-center px-2')}>
                {SUGGESTIONS.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => sendMessage(suggestion)}
                    style={tw.style(
                      'bg-secondary/70 border border-primary/20 rounded-xl px-4 py-3 m-1.5 w-[45%]',
                    )}>
                    <Text
                      style={tw.style(
                        'text-white/80 font-montserrat text-xs text-center',
                      )}>
                      "{suggestion}"
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((message, index) => (
              <View
                key={message.id || index}
                style={tw.style(
                  'mb-4 max-w-[85%] rounded-2xl p-4',
                  message.type === 'user'
                    ? 'bg-primary/20 self-end rounded-tr-sm border border-primary/30'
                    : 'bg-secondary self-start rounded-tl-sm',
                )}>
                {message.toolsCalled && (
                  <View
                    style={tw.style(
                      'flex-row items-center bg-primary/20 self-start px-2 py-1 flex-wrap rounded-full mb-2',
                    )}>
                    <AlertCircle
                      size={12}
                      color={tw.color('primary')}
                      style={tw.style('mr-1')}
                    />
                    <Text
                      style={tw.style(
                        'text-primary font-montserratBold text-[10px]',
                      )}>
                      Reminder Scheduled
                    </Text>
                  </View>
                )}

                {message.text ? (
                  <Text
                    style={tw.style(
                      'text-white font-montserrat text-sm leading-5',
                    )}>
                    {message.text}
                  </Text>
                ) : null}

                {/* Generative UI Component Rendering */}
                {message.component === 'MotorcycleStatus' && activeMotorcycle && (
                  <View
                    style={tw.style(
                      'mt-4 bg-dark border border-primary/30 rounded-xl overflow-hidden w-64',
                    )}>
                    <View
                      style={tw.style(
                        'p-3 bg-secondary/80 border-b border-white/5',
                      )}>
                      <View style={tw.style('flex-row items-center mb-2')}>
                        <View
                          style={tw.style(
                            'bg-darkGrey rounded-full w-8 h-8 items-center justify-center mr-2',
                          )}>
                          <Bike size={14} color={tw.color('white')} />
                        </View>
                        <View>
                          <Text
                            style={tw.style(
                              'text-white font-montserratBold text-sm',
                            )}
                            numberOfLines={1}>
                            {activeMotorcycle.name}
                          </Text>
                          <Text
                            style={tw.style(
                              'text-primary font-montserrat text-xs',
                            )}>
                            {activeMotorcycle.plateNumber}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={tw.style(
                          'flex-row items-center justify-between mt-1',
                        )}>
                        <Text
                          style={tw.style(
                            'text-white/60 font-montserrat text-xs',
                          )}>
                          Odometer Asli:
                        </Text>
                        <Text
                          style={tw.style(
                            'text-white font-montserratBold text-sm',
                          )}>
                          {activeMotorcycle.currentOdoMeter.toLocaleString(
                            'id-ID',
                          )}{' '}
                          KM
                        </Text>
                      </View>
                    </View>

                    <View style={tw.style('flex-row items-center')}>
                      <TouchableOpacity
                        style={tw.style(
                          'flex-1 flex-row items-center justify-center py-2.5 border-r border-white/5 bg-secondary',
                        )}
                        activeOpacity={0.7}
                        onPress={() => {
                          setTempOdo(
                            activeMotorcycle.currentOdoMeter.toString(),
                          );
                          setIsModalVisible(true);
                        }}>
                        <Edit3 size={14} color={tw.color('white')} />
                        <Text
                          style={tw.style(
                            'text-white font-montserrat ml-1.5 text-xs',
                          )}>
                          Update KM
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={tw.style(
                          'flex-1 flex-row items-center justify-center py-2.5 bg-primary/20',
                        )}
                        activeOpacity={0.7}
                        onPress={() =>
                          navigation.navigate('MotorcycleDetailScreen', {
                            motorcycleId: activeMotorcycle._id.toHexString(),
                          })
                        }>
                        <Text
                          style={tw.style(
                            'text-primary font-montserratBold ml-1 text-xs mr-1',
                          )}>
                          Lihat Detail
                        </Text>
                        <ChevronRight size={14} color={tw.color('primary')} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Parts Health UI Component Rendering */}
                {message.component === 'PartsHealth' && activeMotorcycle && (
                  <View style={tw.style('mt-4 w-72')}>
                    <PartsHealthCard
                      services={services.filter(
                        serviceRecord =>
                          serviceRecord.motorcycleId?.toHexString() ===
                          activeMotorcycle._id.toHexString(),
                      )}
                      currentOdoMeter={activeMotorcycle.currentOdoMeter}
                      onQuickLog={partName =>
                        sendMessage(`Saya baru aja ganti ${partName}`)
                      }
                    />
                  </View>
                )}

                {/* Quick Log UI Component Rendering */}
                {message.component === 'QuickLogService' &&
                  message.data &&
                  activeMotorcycle && (
                    <QuickLogCard
                      activeMotorcycle={activeMotorcycle}
                      serviceType={message.data.serviceType}
                      items={message.data.items}
                      onSave={(motorcycleId, type, totalPrice, serviceItems) => {
                        createService({
                          motorcycleId: motorcycleId,
                          serviceType: type,
                          serviceDate: new Date(),
                          odometerAtService:
                            parseInt(activeMotorcycle.currentOdoMeter, 10) || 0,
                          cost: totalPrice,
                          items: serviceItems,
                        });
                        if (addSystemMessage) {
                          addSystemMessage(
                            `Mantap! Pengeluaran kamu udah sukses masuk ke rekap.\n\n🛠️  Tipe: ${type}\n💰  Total: Rp ${totalPrice.toLocaleString(
                              'id-ID',
                            )}`,
                          );
                        }
                      }}
                    />
                  )}

                {/* Service History UI Component Rendering */}
                {message.component === 'ServiceHistory' && activeMotorcycle && (
                  <View style={tw.style('mt-4 w-72')}>
                    {services
                      .filter(
                        serviceRecord =>
                          serviceRecord.motorcycleId?.toHexString() ===
                            activeMotorcycle._id.toHexString() &&
                          (!message.data?.searchQuery ||
                            (serviceRecord.serviceType &&
                              serviceRecord.serviceType
                                .toLowerCase()
                                .includes(
                                  message.data.searchQuery.toLowerCase(),
                                )) ||
                            (serviceRecord.notes &&
                              serviceRecord.notes
                                .toLowerCase()
                                .includes(
                                  message.data.searchQuery.toLowerCase(),
                                )) ||
                            (serviceRecord.items &&
                              serviceRecord.items
                                .toLowerCase()
                                .includes(message.data.searchQuery.toLowerCase()))),                      )
                      .slice(0, 1)
                      .map(service => (
                        <ServiceCard
                          key={service._id.toHexString()}
                          service={service}
                          motorcycleName={activeMotorcycle.name}
                          onPress={() =>
                            navigation.navigate('ServiceDetailScreen', {
                              serviceId: service._id.toHexString(),
                            })
                          }
                        />
                      ))}
                  </View>
                )}

                {/* Expense Analytics UI Component Rendering */}
                {message.component === 'ExpenseAnalytics' && activeMotorcycle && (
                  <View style={tw.style('mt-1 w-72')}>
                    <ExpenseAnalyticsCard
                      services={services.filter(
                        serviceRecord =>
                          serviceRecord.motorcycleId?.toHexString() ===
                          activeMotorcycle._id.toHexString(),
                      )}
                    />
                  </View>
                )}

                {/* Diagnostic Flow UI Component Rendering */}
                {message.component === 'Diagnostic' && message.data && (
                  <View style={tw.style('mt-1 w-72')}>
                    <DiagnosticCard
                      symptom={message.data.symptom}
                      question={message.data.question}
                      options={message.data.options}
                      onSelectOption={option =>
                        sendMessage(`[Diagnosa]: ${option}`)
                      }
                    />
                  </View>
                )}
              </View>
            ))
          )}

          {isLoading && (
            <View
              style={tw.style(
                'self-start bg-secondary rounded-2xl rounded-tl-sm p-4 mb-4',
              )}>
              <ActivityIndicator size="small" color={tw.color('primary')} />
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View
          style={tw.style(
            'flex-row items-center bg-secondary mx-6 mb-6 p-2 rounded-full border border-white/10',
          )}>
          <TextInput
            style={tw.style('flex-1 text-white font-montserrat px-4 h-11')}
            placeholder="Tulis pesan ke MotoAI..."
            placeholderTextColor={tw.color('darkGrey')}
            value={inputText}
            onChangeText={setInputText}
            editable={!isLoading}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || !inputText.trim()}
            style={tw.style(
              'w-10 h-10 rounded-full bg-primary items-center justify-center',
              (!inputText.trim() || isLoading) && 'opacity-50',
            )}>
            <Send size={18} color={tw.color('white')} style={tw.style('')} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Odometer Update Modal */}
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
              Cepat update jarak tempuh motor kamu biar MotoAI makin akurat.
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
                Simpan & Lanjut
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Container>
  );
}
