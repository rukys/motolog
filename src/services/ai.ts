import { GoogleGenAI, FunctionCallingConfigMode, FunctionDeclaration, Type } from '@google/genai';
import Config from 'react-native-config';
import { SERVICE_ITEM_TYPES } from '../constants/service';
import { Motorcycle } from '../models/motorcycle';
import { Service } from '../models/service';

// 1. Initialize Gemini
const ai = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY || '' });

// 2. Define Function Declarations
const addReminderDeclaration: FunctionDeclaration = {
  name: 'addReminder',
  description:
    'Schedules a new maintenance reminder for the user. Call this to proactively remind the user to check or service their motorcycle.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: 'Type of reminder: "AI_SUGGESTION" or "ODO_CHECK"',
      },
      title: {
        type: Type.STRING,
        description: 'Short, catchy title of the reminder. e.g. "Cek Kampas Rem Depan"',
      },
      body: {
        type: Type.STRING,
        description: 'Detailed explanation of why this reminder was scheduled.',
      },
      expectedValue: {
        type: Type.NUMBER,
        description: 'Optional. The Odometer value (in KM) at which the user should do this. Pass null if it is time-based only.',
      },
      expectedDate: {
        type: Type.STRING,
        description: 'Optional. ISO 8601 date string when this reminder should trigger. Pass null if it is distance-based only.',
      },
    },
    required: ['type', 'title', 'body'],
  },
};

const showMotorcycleStatusDeclaration: FunctionDeclaration = {
  name: 'showMotorcycleStatus',
  description: 'Shows a visual UI card of the current motorcycle status in the chat.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      actionInfo: {
        type: Type.STRING,
        description: 'Brief explanation of what the card shows.',
      },
    },
  },
};

const showPartsHealthDeclaration: FunctionDeclaration = {
  name: 'showPartsHealth',
  description: 'Shows a visual progress bar chart of the health of the motorcycle parts.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      actionInfo: {
        type: Type.STRING,
        description: 'Brief description before showing the parts chart.',
      },
    },
  },
};

const quickLogServiceDeclaration: FunctionDeclaration = {
  name: 'quickLogService',
  description: 'Proposes a pre-filled fast UI form for the user to submit a service/expense record.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      serviceType: {
        type: Type.STRING,
        description: 'The general type of service (e.g. "Bengkel Rutin", "Ganti Busi").',
      },
      items: {
        type: Type.ARRAY,
        description: 'List of specific parts or services performed.',
        items: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'The standard category. MUST match SERVICE_ITEM_TYPES.',
              enum: [...SERVICE_ITEM_TYPES],
            },
            estimatedCost: {
              type: Type.INTEGER,
              description: 'The estimated cost in Rupiah.',
            },
          },
          required: ['category', 'estimatedCost'],
        },
      },
      actionInfo: {
        type: Type.STRING,
        description: 'Text introducing the form.',
      },
    },
    required: ['serviceType', 'items'],
  },
};

const showServiceHistoryDeclaration: FunctionDeclaration = {
  name: 'showServiceHistory',
  description: 'Shows a list of the recent service history of the motorcycle.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      actionInfo: {
        type: Type.STRING,
        description: 'Brief explanation text for the user.',
      },
      searchQuery: {
        type: Type.STRING,
        description: 'Optional standard category to search for.',
        enum: [...SERVICE_ITEM_TYPES],
      },
    },
  },
};

const showExpenseAnalyticsDeclaration: FunctionDeclaration = {
  name: 'showExpenseAnalytics',
  description: 'Shows a stacked bar chart of the motorcycle expense breakdown.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      actionInfo: {
        type: Type.STRING,
        description: 'Brief text explaining the chart.',
      },
    },
  },
};

const switchMotorcycleDeclaration: FunctionDeclaration = {
  name: 'switchMotorcycle',
  description: 'Automatically switches the active motorcycle context in the application.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      motorcycleId: {
        type: Type.STRING,
        description: 'The exact _id string of the motorcycle to switch to.',
      },
      motorcycleName: {
        type: Type.STRING,
        description: 'The name of the motorcycle being switched to.',
      },
    },
    required: ['motorcycleId', 'motorcycleName'],
  },
};

const startDiagnosticDeclaration: FunctionDeclaration = {
  name: 'startDiagnostic',
  description: 'Starts an interactive diagnostic questionnaire for mechanical issues.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      symptom: {
        type: Type.STRING,
        description: 'The summarized symptom.',
      },
      question: {
        type: Type.STRING,
        description: 'A follow up question.',
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: '2 to 4 possible answers for the user to choose from.',
      },
    },
    required: ['symptom', 'question', 'options'],
  },
};

const updateOdometerDeclaration: FunctionDeclaration = {
  name: 'updateOdometer',
  description: 'Updates the motorcycle odometer (KM).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      newOdometer: {
        type: Type.INTEGER,
        description: 'The new odometer value in KM.',
      },
    },
    required: ['newOdometer'],
  },
};

// 3. Construct Garage Context
export const buildGarageContext = (
  activeMotorcycle: Motorcycle | undefined,
  activeServices: Service[],
  allMotorcycles: Motorcycle[] = []
): string => {
  if (!activeMotorcycle) {
    return 'User has no motorcycle selected.';
  }

  let garageContextText = `Active Motorcycle Name: ${activeMotorcycle.name}\n`;
  garageContextText += `Plate: ${activeMotorcycle.plateNumber}\n`;
  garageContextText += `Current Odometer: ${activeMotorcycle.currentOdoMeter} KM\n\n`;
  garageContextText += 'Recent Service History:\n';

  if (activeServices && activeServices.length > 0) {
    const recentServices = activeServices.slice(0, 5);
    recentServices.forEach((serviceRecord) => {
      garageContextText += `- Date: ${new Date(
        serviceRecord.serviceDate
      ).toLocaleDateString()}, Odo: ${serviceRecord.odometerAtService} KM, Type: ${
        serviceRecord.serviceType
      }, Notes: ${serviceRecord.notes || '-'}\n`;
      try {
        if (serviceRecord.items) {
          const parsedItems = JSON.parse(serviceRecord.items);
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            garageContextText += `  Parts Changed: ${parsedItems
              .map((item: any) => item.type || item.description)
              .join(', ')}\n`;
          }
        }
      } catch {}
    });
  } else {
    garageContextText += '- No records yet.\n';
  }

  if (allMotorcycles.length > 1) {
    garageContextText += '\nOther Motorcycles Owned By User:\n';
    allMotorcycles.forEach((motorcycle) => {
      if (motorcycle._id.toHexString() !== activeMotorcycle._id.toHexString()) {
        garageContextText += `- Name: ${motorcycle.name}, Plate: ${
          motorcycle.plateNumber
        }, ID: ${motorcycle._id.toHexString()}\n`;
      }
    });
  }

  const currentOdo = activeMotorcycle.currentOdoMeter || 0;
  const oilChangeServices = activeServices.filter((s) =>
    s.serviceType?.toLowerCase().includes('oli')
  );

  if (oilChangeServices.length === 0) {
    garageContextText += '\n[URGENT LOCAL WARNING: User belum pernah mencatat ganti oli!]';
  } else {
    const lastOilChange = oilChangeServices.sort(
      (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
    )[0];
    const distance = currentOdo - (lastOilChange.odometerAtService || 0);
    if (distance >= 2000) {
      garageContextText += `\n[URGENT LOCAL WARNING: Sudah ${distance} KM sejak ganti oli!]`;
    }
  }

  return garageContextText;
};

// 4. Core AI Invocation
export const askAgenticMotoAI = async (chatMessages: any[], garageContext: string) => {
  if (!Config.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const formattedHistory = chatMessages.map((m) => ({
    role: m.type === 'user' ? 'user' : 'model',
    parts: [{ text: m.text || '...' }],
  }));

  const systemPrompt = `You are MotoAI... Context:\n${garageContext}`;

  const callModel = async (modelName: string) => {
    return await ai.models.generateContent({
      model: modelName,
      contents: formattedHistory,
      config: {
        temperature: 0.7,
        systemInstruction: systemPrompt,
        tools: [
          {
            functionDeclarations: [
              addReminderDeclaration,
              showMotorcycleStatusDeclaration,
              showPartsHealthDeclaration,
              quickLogServiceDeclaration,
              showServiceHistoryDeclaration,
              showExpenseAnalyticsDeclaration,
              switchMotorcycleDeclaration,
              startDiagnosticDeclaration,
              updateOdometerDeclaration,
            ],
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO,
          },
        },
      },
    });
  };

  const models = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview',
  ];

  for (const model of models) {
    try {
      const result = await callModel(model);
      return {
        text: result.text,
        functionCalls: result.functionCalls,
      };
    } catch (e: any) {
      if (e.status === 429) {continue;}
      throw e;
    }
  }
};
