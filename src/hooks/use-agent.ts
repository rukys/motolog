import { useState } from 'react';
import useGlobalStore from '../stores/global';
import { useMotorcycle } from './use-motorcycle';
import { useService } from './use-service';
import { useReminder } from './use-reminder';
import { buildGarageContext, askAgenticMotoAI } from '../services/ai';

export interface Message {
  id: string;
  text: string;
  type: 'user' | 'ai';
  toolsCalled?: boolean;
  component?: string;
  data?: any;
}

export const useAgent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { selectedMotorcycleId, setSelectedMotorcycleId } = useGlobalStore();
  const { getMotorcycleById, motorcycles, updateOdometer } = useMotorcycle();
  const { services: allServices } = useService();
  const { createReminder } = useReminder();

  const activeMotorcycle = selectedMotorcycleId ? getMotorcycleById(selectedMotorcycleId) : null;
  const activeServices = allServices.filter(s => s.motorcycleId.toHexString() === selectedMotorcycleId);

  const sendMessage = async (text: string) => {
    if (!text.trim()) {return;}

    const userMsg: Message = { id: Date.now().toString(), text, type: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const context = buildGarageContext(activeMotorcycle || undefined, activeServices as any, motorcycles as any);
      const aiResult = await askAgenticMotoAI([...messages, userMsg], context);

      if (aiResult) {
        let aiTextResponse = aiResult.text;
        let uiComponent = '';
        let uiData: any = null;
        let toolsCalled = false;

        if (aiResult.functionCalls && aiResult.functionCalls.length > 0) {
          for (const functionCall of aiResult.functionCalls) {
            if (functionCall.name === 'addReminder') {
              const args = functionCall.args as any;
              createReminder({
                motorcycleId: activeMotorcycle!._id,
                type: args.type,
                title: args.title,
                body: args.body,
                expectedValue: args.expectedValue,
                expectedDate: args.expectedDate ? new Date(args.expectedDate) : undefined,
              });
              toolsCalled = true;
            } else if (functionCall.name === 'showMotorcycleStatus') {
              uiComponent = 'MotorcycleStatus';
              toolsCalled = true;
            } else if (functionCall.name === 'showPartsHealth') {
              uiComponent = 'PartsHealth';
              toolsCalled = true;
            } else if (functionCall.name === 'quickLogService') {
              uiComponent = 'QuickLogService';
              uiData = functionCall.args;
              toolsCalled = true;
            } else if (functionCall.name === 'showServiceHistory') {
              uiComponent = 'ServiceHistory';
              uiData = functionCall.args;
              toolsCalled = true;
            } else if (functionCall.name === 'showExpenseAnalytics') {
              uiComponent = 'ExpenseAnalytics';
              toolsCalled = true;
            } else if (functionCall.name === 'switchMotorcycle') {
              const { motorcycleId } = functionCall.args as any;
              setSelectedMotorcycleId(motorcycleId);
              toolsCalled = true;
            } else if (functionCall.name === 'startDiagnostic') {
              uiComponent = 'Diagnostic';
              uiData = functionCall.args;
              toolsCalled = true;
            } else if (functionCall.name === 'updateOdometer') {
              const { newOdometer } = functionCall.args as any;
              if (activeMotorcycle) {
                updateOdometer(activeMotorcycle._id, newOdometer);
              }
              uiComponent = 'MotorcycleStatus';
              toolsCalled = true;
            }
          }
        }

        const newAiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiTextResponse || 'Sip, sudah saya proses kak!',
          type: 'ai',
          toolsCalled,
          component: uiComponent,
          data: uiData,
        };
        setMessages(prev => [...prev, newAiMessage]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Error calling AI', type: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const addSystemMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        type: 'ai',
      },
    ]);
  };

  return { messages, isLoading, sendMessage, activeMotorcycle, addSystemMessage };
};
