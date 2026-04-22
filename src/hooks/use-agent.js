import { useState } from 'react';
import { useMotorcycle, useService, useReminder } from './';
import { globalStore } from '../stores';
import { askAgenticMotoAI, buildGarageContext } from '../services/ai';

export const useAgent = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { motorcycles, updateOdometer } = useMotorcycle();
  const { services } = useService();
  const { addReminder } = useReminder();
  const { selectedMotorcycleId, setSelectedMotorcycleId } = globalStore();

  const activeMotorcycle =
    motorcycles.find(
      motorcycle => motorcycle._id.toHexString() === selectedMotorcycleId,
    ) || motorcycles[0];
  const activeServices = services.filter(
    serviceRecord =>
      serviceRecord.motorcycleId?.toHexString() ===
      activeMotorcycle?._id?.toHexString(),
  );

  const sendMessage = async userMessage => {
    if (!userMessage.trim()) {
      return;
    }

    // Add user message to UI
    const newUserMessage = {
      id: Date.now().toString(),
      text: userMessage,
      type: 'user',
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const garageContext = buildGarageContext(
        activeMotorcycle,
        activeServices,
        motorcycles,
      );

      const response = await askAgenticMotoAI(updatedMessages, garageContext);

      let aiTextResponse = response.text || '';
      let toolsCalled = false;
      let uiComponent = null;
      let uiData = null;

      // Handle Function Calls (Agentic Behavior)
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const functionCall of response.functionCalls) {
          if (functionCall.name === 'addReminder') {
            if (!activeMotorcycle) {
              aiTextResponse =
                'Eits, kamu belum nambahin motor di garasi nih. Tambahin dulu gih biar saya bisa ngingetin!';
            } else {
              const { type, title, body, expectedValue, expectedDate } =
                functionCall.args;

              // Execute the tool locally!
              addReminder(
                activeMotorcycle._id,
                type,
                title,
                body,
                expectedValue,
                expectedDate ? new Date(expectedDate) : null,
              );
            }
            toolsCalled = true;
          } else if (functionCall.name === 'showMotorcycleStatus') {
            if (!activeMotorcycle) {
              aiTextResponse =
                'Kamu belum punya motor di garasi nih kak. Masukin motor kamu dulu ya lewat halaman depan!';
            } else {
              const { actionInfo } = functionCall.args;
              if (actionInfo) {
                aiTextResponse = actionInfo;
              } else if (!aiTextResponse) {
                aiTextResponse = 'Nih kak, profil motor kamu sekarang:';
              }
              uiComponent = 'MotorcycleStatus';
            }
            toolsCalled = true;
          } else if (functionCall.name === 'showPartsHealth') {
            if (!activeMotorcycle) {
              aiTextResponse =
                'Motor aja belum punya kak, apanya yang mau dicek sparepartnya? 😂 Tambahin motor dulu ya!';
            } else if (activeServices.length === 0) {
              aiTextResponse =
                'Kamu belum pernah nyatet rekap servis atau ganti parts apapun nih kak, jadi MotoAI belum bisa prediksi umur kampas rem dll. Mulai rutin nyatet pengeluaran dulu ya!';
            } else {
              const { actionInfo } = functionCall.args;
              if (actionInfo) {
                aiTextResponse = actionInfo;
              } else if (!aiTextResponse) {
                aiTextResponse = 'Ini estimasi kondisi parts motor kamu kak:';
              }
              uiComponent = 'PartsHealth';
            }
            toolsCalled = true;
          } else if (functionCall.name === 'quickLogService') {
            if (!activeMotorcycle) {
              aiTextResponse =
                'Bentar, kamu nyervis apaan nih? Orang kamu belum daftar motornya di aplikasi... 😂 Bikin data motornya dulu ya di home!';
            } else {
              const { serviceType, items, actionInfo } = functionCall.args;
              if (actionInfo) {
                aiTextResponse = actionInfo;
              } else if (!aiTextResponse) {
                aiTextResponse = `Siap, saya bikinin form cepet buat nyatet ${serviceType}.`;
              }
              uiComponent = 'QuickLogService';
              uiData = { serviceType, items };
            }
            toolsCalled = true;
          } else if (functionCall.name === 'showServiceHistory') {
            if (!activeMotorcycle) {
              aiTextResponse =
                'Gimana mau ngecek history kak, motornya aja belum kamu masukin! 😂';
            } else if (activeServices.length === 0) {
              aiTextResponse =
                'Belum ada riwayat servis untuk motor ini kak. Kosong melompong!';
            } else {
              const { actionInfo, searchQuery } = functionCall.args;
              let matchedServices = activeServices;

              if (searchQuery) {
                const searchTerm = searchQuery.toLowerCase();
                matchedServices = activeServices.filter(
                  serviceRecord =>
                    (serviceRecord.serviceType &&
                      serviceRecord.serviceType
                        .toLowerCase()
                        .includes(searchTerm)) ||
                    (serviceRecord.notes &&
                      serviceRecord.notes.toLowerCase().includes(searchTerm)) ||
                    (serviceRecord.items &&
                      serviceRecord.items.toLowerCase().includes(searchTerm)),
                );
              }

              if (matchedServices.length === 0 && searchQuery) {
                aiTextResponse = `Wah kak, dari catatan saya kamu belum pernah nyatet servis/ganti "${searchQuery}" di motor ini.`;
              } else {
                if (actionInfo) {
                  aiTextResponse = actionInfo;
                } else if (!aiTextResponse) {
                  aiTextResponse = searchQuery
                    ? `Ini catatan terakhir kamu soal ${searchQuery}:`
                    : 'Ini riwayat servis kamu kak:';
                }
                uiComponent = 'ServiceHistory';
                uiData = { searchQuery };
              }
            }
            toolsCalled = true;
          } else if (functionCall.name === 'showExpenseAnalytics') {
            if (!activeMotorcycle) {
              aiTextResponse =
                'Gimana mau ngecek pengeluaran kak, motornya aja belum kamu masukin! 😂';
            } else {
              const { actionInfo } = functionCall.args;
              if (actionInfo) {
                aiTextResponse = actionInfo;
              } else if (!aiTextResponse) {
                aiTextResponse = 'Ini rincian pengeluaran kamu sejauh ini kak:';
              }
              uiComponent = 'ExpenseAnalytics';
            }
            toolsCalled = true;
          } else if (functionCall.name === 'switchMotorcycle') {
            const { motorcycleId, motorcycleName } = functionCall.args;
            if (motorcycleId) {
              setSelectedMotorcycleId(motorcycleId);
              aiTextResponse = `Sip, garasi kamu udah saya pindahin ke ${
                motorcycleName || 'motor kamu yang itu'
              }. Mau ngecek apa nih sekarang?`;
              toolsCalled = true;
            }
          } else if (functionCall.name === 'startDiagnostic') {
            const { symptom, question, options } = functionCall.args;
            uiComponent = 'Diagnostic';
            uiData = { symptom, question, options };
            aiTextResponse = ''; // Keep it silent so the Card does the talking
            toolsCalled = true;
          } else if (functionCall.name === 'updateOdometer') {
            const { newOdometer } = functionCall.args;
            if (activeMotorcycle) {
              updateOdometer(activeMotorcycle._id, newOdometer);
              aiTextResponse = `Sip kak! Angka Odometer motor kamu udah saya update ke sistem jadi ${newOdometer.toLocaleString(
                'id-ID',
              )} KM. Cek rutin jadwal servis ya!`;
              uiComponent = 'MotorcycleStatus';
              toolsCalled = true;
            }
          }
        }

        // If the AI used a tool but didn't provide a text response
        if (!aiTextResponse && toolsCalled && !uiComponent) {
          aiTextResponse =
            'Sip, saya udah buatin pengingatnya buat motor kamu! Cek di daftar Reminders ya kak. 🏍️';
        }
      }

      // Add AI response to UI
      const newAiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiTextResponse || 'Siap, laksanakan!',
        type: 'ai',
        toolsCalled,
        component: uiComponent,
        data: uiData,
      };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Sori kak, saya lagi gagal fokus nih (API Error). Coba cek koneksi atau key Gemini kamu.',
          type: 'ai',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const addSystemMessage = text => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        type: 'ai',
      },
    ]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    activeMotorcycle,
    addSystemMessage,
  };
};
