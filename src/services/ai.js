import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import Config from 'react-native-config';
import { SERVICE_ITEM_TYPES } from '../constants/service';

// 1. Initialize Gemini
// Config.GEMINI_API_KEY will be loaded from .env
const ai = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY });

// 2. Define the 'addReminder' tool that Gemini can call
const addReminderDeclaration = {
  name: 'addReminder',
  description:
    'Schedules a new maintenance reminder for the user. Call this to proactively remind the user to check or service their motorcycle.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        description: 'Type of reminder: "AI_SUGGESTION" or "ODO_CHECK"',
      },
      title: {
        type: 'string',
        description:
          'Short, catchy title of the reminder. e.g. "Cek Kampas Rem Depan"',
      },
      body: {
        type: 'string',
        description: 'Detailed explanation of why this reminder was scheduled.',
      },
      expectedValue: {
        type: 'number',
        description:
          'Optional. The Odometer value (in KM) at which the user should do this. Pass null if it is time-based only.',
      },
      expectedDate: {
        type: 'string',
        description:
          'Optional. ISO 8601 date string when this reminder should trigger. Pass null if it is distance-based only.',
      },
    },
    required: ['type', 'title', 'body'],
  },
};

const showMotorcycleStatusDeclaration = {
  name: 'showMotorcycleStatus',
  description:
    'Shows a visual UI card of the current motorcycle status in the chat, allowing the user to view details and update their Odometer.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      actionInfo: {
        type: 'string',
        description:
          'Brief explanation of what the card shows, for example: "Ini profil motor kamu kak:"',
      },
    },
  },
};

const showPartsHealthDeclaration = {
  name: 'showPartsHealth',
  description:
    'Shows a visual progress bar chart of the health of the motorcycle parts (oil, brakes, cvt, tires). Call this when the user asks about the condition, lifespan, or longevity of their parts.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      actionInfo: {
        type: 'string',
        description: 'Brief description before showing the parts chart.',
      },
    },
  },
};

const quickLogServiceDeclaration = {
  name: 'quickLogService',
  description:
    'Proposes a pre-filled fast UI form for the user to submit a service/expense record. Call this when the user mentions they recently bought parts, serviced parts, or spent money. You can log multiple items at once.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      serviceType: {
        type: 'string',
        description:
          'The general type of service (e.g. "Bengkel Rutin", "Ganti Busi").',
      },
      items: {
        type: 'array',
        description: 'List of specific parts or services performed.',
        items: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description:
                'The standard category of the part/service. MUST translate Indonesian to the English Enum (e.g. oli -> Engine Oil, busi -> Spark Plug).',
              enum: SERVICE_ITEM_TYPES,
            },
            estimatedCost: {
              type: 'integer',
              description:
                'The estimated cost for this specific item in Rupiah.',
            },
          },
          required: ['category', 'estimatedCost'],
        },
      },
      actionInfo: {
        type: 'string',
        description:
          'Text introducing the form (e.g. "Biar ga lupa, klik Save ya buat nyimpen rekapannya!")',
      },
    },
    required: ['serviceType', 'items'],
  },
};

const showServiceHistoryDeclaration = {
  name: 'showServiceHistory',
  description:
    'Shows a list of the recent service history of the motorcycle. Call this when the user asks to see their service history, expense history, or past repairs.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      actionInfo: {
        type: 'string',
        description:
          'Brief explanation text for the user, example: "Ini daftar riwayat servis kamu kak:"',
      },
      searchQuery: {
        type: 'string',
        description:
          'Optional standard category to search for a specific service. MUST translate Indonesian to the English Enum (e.g. oli -> Engine Oil, busi -> Spark Plug).',
        enum: SERVICE_ITEM_TYPES,
      },
    },
  },
};

const showExpenseAnalyticsDeclaration = {
  name: 'showExpenseAnalytics',
  description:
    'Shows a stacked bar chart of the motorcycle expense breakdown. Call this when the user asks about their total expenses, cost breakdown, or how much they spent.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      actionInfo: {
        type: 'string',
        description:
          'Brief text explaining the chart, e.g. "Ini rincian pengeluaran kamu kak:"',
      },
    },
  },
};

const switchMotorcycleDeclaration = {
  name: 'switchMotorcycle',
  description:
    'Automatically switches the active motorcycle context in the application. Call this when the user explicitly asks to check or view another motorcycle they own.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      motorcycleId: {
        type: 'string',
        description:
          'The exact _id string of the motorcycle to switch to. Must match one from the garage context.',
      },
      motorcycleName: {
        type: 'string',
        description:
          'The name of the motorcycle being switched to, for the text confirmation.',
      },
    },
    required: ['motorcycleId', 'motorcycleName'],
  },
};

const startDiagnosticDeclaration = {
  name: 'startDiagnostic',
  description:
    'Starts an interactive diagnostic questionnaire when the user complains about a motorcycle symptom (e.g. brebet, mati mendadak, mesin panas).',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      symptom: {
        type: 'string',
        description:
          'The summarized symptom the user is experiencing, e.g. "Motor Brebet".',
      },
      question: {
        type: 'string',
        description:
          'A follow up question to narrow down the cause, e.g. "Brebetnya kerasa pas lagi ngapain ngab?"',
      },
      options: {
        type: 'array',
        items: { type: 'string' },
        description:
          '2 to 4 possible specific conditions or answers for the user to choose from. E.g. ["Pas Mesin Dingin", "Pas Tarikan Atas"]',
      },
    },
    required: ['symptom', 'question', 'options'],
  },
};

const updateOdometerDeclaration = {
  name: 'updateOdometer',
  description:
    'Updates the motorcycle odometer (KM) when the user provides a new kilometer reading.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      newOdometer: {
        type: 'integer',
        description: 'The new odometer value in KM (e.g., 15000).',
      },
    },
    required: ['newOdometer'],
  },
};

// 3. Construct Garage Context
export const buildGarageContext = (
  activeMotorcycle,
  activeServices,
  allMotorcycles = [],
) => {
  if (!activeMotorcycle) {
    return 'User has no motorcycle selected.';
  }

  let context = `Active Motorcycle Name: ${activeMotorcycle.name}\n`;
  context += `Plate: ${activeMotorcycle.plateNumber}\n`;
  context += `Current Odometer: ${activeMotorcycle.currentOdoMeter} KM\n\n`;
  context += 'Recent Service History:\n';

  if (activeServices && activeServices.length > 0) {
    const recent = activeServices.slice(0, 5); // top 5
    recent.forEach(s => {
      context += `- Date: ${new Date(
        s.serviceDate,
      ).toLocaleDateString()}, Odo: ${s.odometerAtService} KM, Type: ${
        s.serviceType
      }, Notes: ${s.notes || '-'}\n`;
      try {
        let items = JSON.parse(s.items);
        if (!Array.isArray(items)) {
          if (typeof items === 'string') {
            items = JSON.parse(items);
          }
          if (!Array.isArray(items)) {
            items = [];
          }
        }
        if (items.length > 0) {
          context += `  Parts Changed: ${items
            .map(i => i.type || i.description)
            .join(', ')}\n`;
        }
      } catch {}
    });
  } else {
    context += '- No records yet.\n';
  }

  if (allMotorcycles.length > 1) {
    context +=
      '\nOther Motorcycles Owned By User (Can switch to these using switchMotorcycle tool):\n';
    allMotorcycles.forEach(m => {
      if (m._id.toHexString() !== activeMotorcycle._id.toHexString()) {
        context += `- Name: ${m.name}, Plate: ${
          m.plateNumber
        }, ID: ${m._id.toHexString()}\n`;
      }
    });
  }

  // --- LOCAL AUTO-WARNING LOGIC (Provokasi AI) ---
  const currentOdo = activeMotorcycle.currentOdoMeter || 0;
  const oliServices = activeServices
    ? activeServices.filter(
        s => s.serviceType && s.serviceType.toLowerCase().includes('oli'),
      )
    : [];

  if (oliServices.length === 0) {
    context +=
      '\n[URGENT LOCAL WARNING: User belum pernah mencatat ganti oli sama sekali di aplikasi ini! Pada respon pertamamu, ingatkan dia dengan sangat sopan menggunakan panggilan Kak/Kamu bahwa catatan servis olinya masih kosong, dan tawarkan dengan proaktif untuk membuat reminder atau mencatat servis terakhirnya sekarang demi menjaga kesehatan mesin!]';
  } else {
    // Sort to get the most recent oil change
    const lastOliService = oliServices.sort(
      (a, b) => new Date(b.serviceDate) - new Date(a.serviceDate),
    )[0];
    const lastOdo = lastOliService.odometerAtService || 0;
    const distanceSinceOli = currentOdo - lastOdo;

    if (distanceSinceOli >= 2000) {
      context += `\n[URGENT LOCAL WARNING: Motor user sudah jalan ${distanceSinceOli} KM sejak ganti oli terakhir (Lebih dari batas 2000 KM)! Pada respon pertamamu, tegur dan omeli dia dengan gaya bahasa gaul karena motornya bisa rusak kalau telat ganti oli, dan tawarkan untuk bikin reminder atau buka form catat servis!]`;
    }
  }
  // ----------------------------------------------

  return context;
};

// 4. The Core AI Invocation
export const askAgenticMotoAI = async (messagesArray, garageContext) => {
  if (!Config.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  // Format history for Gemini SDK
  const formattedContents = messagesArray.map(msg => ({
    role: msg.type === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text || '...' }],
  }));

  const systemContent = `
You are MotoAI, a proactive, smart virtual garage companion for a motorcycle rider.
You respond in a friendly, polite, and conversational style using Indonesian terms (Saya, Kamu, Kak).
Your job is to read the user's prompt and evaluate if they need a reminder set up for their motorcycle.
IMPORTANT: Whenever a tool requires a category (like quickLogService or showServiceHistory), you MUST strictly map the user's Indonesian term to the English SERVICE_ITEM_TYPES Enum. For example: 'oli' -> 'Engine Oil', 'busi' -> 'Spark Plug', 'kampas rem' -> 'Brake Pads', 'ban' -> 'Tires', 'vbelt' -> 'V-Belt', 'filter oli' -> 'Oil Filter', 'filter udara' -> 'Air Filter'.

Here is the current state of their motorcycle:
---
${garageContext}
---

If the user mentions an issue or requests a reminder (e.g. "Saya ngerasa rem blong", "Ingetin saya ganti busi minggu depan", "Ganti oli bulan depan"), you MUST call the "addReminder" tool with appropriate parameters. 
If the user wants to check the status of their motorcycle, view their odometer, or update their KM interactively via UI, you MUST call the "showMotorcycleStatus" tool.
If the user explicitly mentions their current KM and wants to update it (e.g. "Update KM motor saya jadi 15000" or "Odometer sekarang 12000"), you MUST call the "updateOdometer" tool to update it directly.
If the user asks about the condition, wear and tear, lifespan, or health of their parts (kampas rem, oli, cvt), you MUST call the "showPartsHealth" tool.
If the user mentions they recently serviced a part, fixed something, or spent money on the motorcycle, you MUST call the "quickLogService" tool to help them record it. BUT, if they do not mention the cost/price, DO NOT call the tool yet. Instead, ask them conversationally "Habis berapa biayanya kak buat servis itu?" to gather the cost first.
If the user asks to see their service history, past repairs, logs, or asks when they last performed a specific service (e.g. "cek last history", "kapan terakhir ganti oli gardan?"), you MUST call the "showServiceHistory" tool. Pass the specific part as "searchQuery" if they ask for one.
If the user asks about how much money they spent, total expenses, or cost breakdown, you MUST call the "showExpenseAnalytics" tool.
If the user mentions checking another motorcycle they own (e.g., "Coba cek PCX saya", "Ganti ke Vario"), look up the motorcycle ID from the context and call the "switchMotorcycle" tool.
If the user complains about a mechanical issue or symptom (e.g., "Motor saya brebet", "Mesin cepet panas"), you MUST call the "startDiagnostic" tool to interactively find the root cause.
If you don't call the tool, then just reply conversationally with brief advice.
  `;

  const executeCall = async modelName => {
    return await ai.models.generateContent({
      model: modelName,
      contents: formattedContents,
      config: {
        systemInstruction: systemContent,
        temperature: 0.7,
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
            mode: FunctionCallingConfigMode.AUTO, // Automatically decide whether to call this or just reply text
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

  for (let i = 0; i < models.length; i++) {
    try {
      return await executeCall(models[i]);
    } catch (error) {
      // Check if it's a rate limit or quota error (429)
      const isRateLimit =
        error.status === 429 ||
        (error.message && error.message.includes('429')) ||
        (error.message && error.message.toLowerCase().includes('quota'));

      if (isRateLimit && i < models.length - 1) {
        console.warn(
          `MotoAI: Kena Limit di model ${
            models[i]
          }! Pindah otomatis ke model cadangan (${models[i + 1]})...`,
        );
        continue;
      }

      console.error(`MotoAI Error on ${models[i]}:`, error);
      throw error;
    }
  }
};
