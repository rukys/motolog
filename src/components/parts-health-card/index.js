import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import tw from '../../../tailwind';
import { Activity } from 'lucide-react-native';
import BaseCard from '../base-card';

const PARTS_CONFIG = [
  { id: 'oil', label: 'Engine Oil', keywords: ['oli', 'oil'], lifespan: 2000 },
  { id: 'brake', label: 'Brake Pads', keywords: ['kampas', 'rem', 'brake', 'pad'], lifespan: 10000 },
  { id: 'vbelt', label: 'V-Belt / Chain', keywords: ['v-belt', 'vbelt', 'rantai', 'chain'], lifespan: 20000 },
];

const PartsHealthCard = memo(({ services = [], currentOdoMeter = 0 }) => {
  const partsHealth = useMemo(() => {
    return PARTS_CONFIG.map(part => {
      // Find the most recent service where this part was changed
      let lastChangedOdo = 0; // Default if never changed or we don't have records

      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        let items = [];
        try {
          items = JSON.parse(service.items || '[]');
        } catch {}

        const hasPart = items.some(item => {
          const text = ((item.type || '') + ' ' + (item.description || '')).toLowerCase();
          return part.keywords.some(kw => text.includes(kw));
        });

        // Also check serviceType just in case
        const typeMatch = part.keywords.some(kw => (service.serviceType || '').toLowerCase().includes(kw));

        if (hasPart || typeMatch) {
          lastChangedOdo = service.odometerAtService || 0;
          break; // Since services are sorted newest first, the first match is the most recent
        }
      }

      const hasRecord = lastChangedOdo > 0;
      let distance = 0;
      let remaining = 0;
      let healthPercent = 0;
      let colorClass = 'bg-primary border-transparent';

      if (hasRecord) {
        distance = currentOdoMeter - lastChangedOdo;
        if (distance < 0) distance = 0;
        
        remaining = part.lifespan - distance;
        healthPercent = (remaining / part.lifespan) * 100;
        
        if (healthPercent < 0) healthPercent = 0;
        if (healthPercent > 100) healthPercent = 100;

        if (healthPercent < 15) colorClass = 'bg-primary border-transparent';
        else if (healthPercent < 40) colorClass = 'bg-primary/80';
      }

      return {
        ...part,
        hasRecord,
        distance,
        remaining,
        healthPercent,
        colorClass
      };
    });
  }, [services, currentOdoMeter]);

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <BaseCard style={tw.style('mb-4')}>
      <View style={tw.style('flex-row items-center mb-5')}>
        <View style={tw.style('bg-primary/20 p-2 rounded-lg mr-3')}>
          <Activity size={20} color={tw.color('primary')} />
        </View>
        <View style={tw.style('flex-1')}>
          <Text style={tw.style('text-white font-montserratBold text-base')}>
            Parts Health
          </Text>
          <Text style={tw.style('text-darkGrey font-montserrat text-xs')}>
            Estimated lifespan based on ODO
          </Text>
        </View>
      </View>

      <View>
        {partsHealth.map((part, index) => (
          <View key={part.id} style={tw.style(index < partsHealth.length - 1 ? 'mb-4' : '')}>
            <View style={tw.style('flex-row justify-between items-end mb-1.5')}>
              <Text style={tw.style('text-white font-montserratSemiBold text-sm')}>
                {part.label}
              </Text>
              {part.hasRecord ? (
                <Text style={tw.style(part.healthPercent < 15 ? 'text-primary font-montserratBold' : 'text-darkGrey font-montserrat', 'text-xs')}>
                  {part.remaining > 0 
                    ? `${part.remaining.toLocaleString('id-ID')} KM left` 
                    : `Overdue by ${Math.abs(part.remaining).toLocaleString('id-ID')} KM`}
                </Text>
              ) : (
                <Text style={tw.style('text-darkGrey font-montserrat text-xs')}>
                  No record found
                </Text>
              )}
            </View>
            <View style={tw.style('h-2.5 bg-dark w-full rounded-full overflow-hidden border border-darkGrey')}>
              <View 
                style={tw.style(`h-full rounded-full ${part.hasRecord ? part.colorClass : 'bg-transparent'}`)} 
                width={`${part.hasRecord ? part.healthPercent : 0}%`} 
              />
            </View>
          </View>
        ))}
      </View>
    </BaseCard>
  );
});

export default PartsHealthCard;
