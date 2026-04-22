import { useMemo } from 'react';

const PARTS_CONFIG = [
  { id: 'oil', label: 'Engine Oil', keywords: ['oli', 'oil'], lifespan: 2000 },
  {
    id: 'brake',
    label: 'Brake Pads',
    keywords: ['kampas', 'rem', 'brake', 'pad'],
    lifespan: 10000,
  },
  {
    id: 'vbelt',
    label: 'V-Belt / Chain',
    keywords: ['v-belt', 'vbelt', 'rantai', 'chain'],
    lifespan: 20000,
  },
];

export const usePartsHealth = (services = [], currentOdoMeter = 0) => {
  return useMemo(() => {
    return PARTS_CONFIG.map(part => {
      let lastChangedOdo = 0;

      for (let index = 0; index < services.length; index++) {
        const service = services[index];
        const typeMatch = part.keywords.some(keyword =>
          (service.serviceType || '').toLowerCase().includes(keyword),
        );

        let hasMatchingPartInItems = false;
        if (!typeMatch) {
          let parsedItems = [];
          try {
            parsedItems = JSON.parse(service.items || '[]');
            if (!Array.isArray(parsedItems)) {
              // Handle case where double stringify caused it to parse as string
              if (typeof parsedItems === 'string') {
                parsedItems = JSON.parse(parsedItems);
              }
              if (!Array.isArray(parsedItems)) {
                parsedItems = [];
              }
            }
          } catch {}

          hasMatchingPartInItems = parsedItems.some(serviceItem => {
            const combinedText = (
              (serviceItem.type || '') +
              ' ' +
              (serviceItem.description || '')
            ).toLowerCase();
            return part.keywords.some(keyword =>
              combinedText.includes(keyword),
            );
          });
        }

        if (hasMatchingPartInItems || typeMatch) {
          lastChangedOdo = service.odometerAtService || 0;
          break;
        }
      }

      const hasRecord = lastChangedOdo > 0;
      let distance = 0;
      let remaining = 0;
      let healthPercent = 0;
      let colorClass = 'bg-primary border-transparent';

      if (hasRecord) {
        distance = currentOdoMeter - lastChangedOdo;
        if (distance < 0) {
          distance = 0;
        }

        remaining = part.lifespan - distance;
        healthPercent = (remaining / part.lifespan) * 100;

        if (healthPercent < 0) {
          healthPercent = 0;
        }
        if (healthPercent > 100) {
          healthPercent = 100;
        }

        if (healthPercent < 15) {
          colorClass = 'bg-primary border-transparent';
        } else if (healthPercent < 40) {
          colorClass = 'bg-primary/80';
        }
      }

      return {
        ...part,
        hasRecord,
        distance,
        remaining,
        healthPercent,
        colorClass,
      };
    });
  }, [services, currentOdoMeter]);
};
