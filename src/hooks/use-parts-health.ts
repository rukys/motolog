import { useMemo } from 'react';
import { Service } from '../models/service';

export interface PartConfig {
  id: string;
  label: string;
  keywords: string[];
  lifespan: number;
}

export interface PartHealth extends PartConfig {
  hasRecord: boolean;
  distance: number;
  remaining: number;
  healthPercent: number;
  colorClass: string;
}

const PARTS_CONFIG: PartConfig[] = [
  { id: 'oil', label: 'Engine Oil', keywords: ['oli', 'oil'], lifespan: 2000 },
  { id: 'brake', label: 'Brake Pads', keywords: ['kampas', 'rem', 'brake', 'pad'], lifespan: 10000 },
  { id: 'vbelt', label: 'V-Belt / Chain', keywords: ['v-belt', 'vbelt', 'rantai', 'chain'], lifespan: 20000 },
];

export const usePartsHealth = (services: Service[] = [], currentOdoMeter: number = 0): PartHealth[] => {
  return useMemo(() => {
    return PARTS_CONFIG.map((part) => {
      let lastChangedOdo = 0;

      for (const service of services) {
        const typeMatch = part.keywords.some((keyword) =>
          (service.serviceType || '').toLowerCase().includes(keyword)
        );

        let hasMatchingPartInItems = false;
        if (!typeMatch && service.items) {
          try {
            const parsedItems = JSON.parse(service.items);
            if (Array.isArray(parsedItems)) {
              hasMatchingPartInItems = parsedItems.some((item: any) => {
                const text = ((item.type || '') + ' ' + (item.description || '')).toLowerCase();
                return part.keywords.some((k) => text.includes(k));
              });
            }
          } catch {}
        }

        if (typeMatch || hasMatchingPartInItems) {
          lastChangedOdo = service.odometerAtService || 0;
          break;
        }
      }

      const hasRecord = lastChangedOdo > 0;
      let distance = 0;
      let remaining = part.lifespan;
      let healthPercent = 0;
      let colorClass = 'bg-primary border-transparent';

      if (hasRecord) {
        distance = Math.max(0, currentOdoMeter - lastChangedOdo);
        remaining = Math.max(0, part.lifespan - distance);
        healthPercent = Math.min(100, Math.max(0, (remaining / part.lifespan) * 100));

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
