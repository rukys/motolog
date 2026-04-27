import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../../../tailwind';
import { Activity } from 'lucide-react-native';
import BaseCard from '../base-card';
import { usePartsHealth } from '../../hooks';
import { Service } from '../../models/service';

interface PartsHealthCardProps {
  services?: Service[];
  currentOdoMeter?: number;
  onQuickLog?: (partName: string) => void;
}

const PartsHealthCard = memo<PartsHealthCardProps>(
  ({ services = [], currentOdoMeter = 0, onQuickLog }) => {
    const partsHealth = usePartsHealth(services as any, currentOdoMeter);

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
            <View
              key={part.id}
              style={tw.style(index < partsHealth.length - 1 ? 'mb-4' : '')}>
              <View
                style={tw.style('flex-row justify-between items-end mb-1.5')}>
                <View style={tw.style('flex-row items-center')}>
                  <Text
                    style={tw.style(
                      'text-white font-montserratSemiBold text-sm mr-2',
                    )}>
                    {part.label}
                  </Text>
                  {part.hasRecord && part.healthPercent <= 20 && onQuickLog && (
                    <TouchableOpacity
                      onPress={() => onQuickLog(part.label)}
                      style={tw.style(
                        'bg-error/20 border border-error/50 px-2 py-0.5 rounded',
                      )}>
                      <Text
                        style={tw.style(
                          'text-error font-montserratBold text-[9px]',
                        )}>
                        Catat Ganti
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {part.hasRecord ? (
                  <Text
                    style={tw.style(
                      part.healthPercent < 15
                        ? 'text-primary font-montserratBold'
                        : 'text-darkGrey font-montserrat',
                      'text-xs',
                    )}>
                    {part.remaining > 0
                      ? `${part.remaining.toLocaleString('id-ID')} KM left`
                      : `Overdue by ${Math.abs(part.remaining).toLocaleString(
                          'id-ID',
                        )} KM`}
                  </Text>
                ) : (
                  <Text
                    style={tw.style('text-darkGrey font-montserrat text-xs')}>
                    No record found
                  </Text>
                )}
              </View>
              <View
                style={tw.style(
                  'h-2.5 bg-dark w-full rounded-full overflow-hidden border border-darkGrey',
                )}>
                <View
                  style={tw.style(
                    `h-full rounded-full ${
                      part.hasRecord ? part.colorClass : 'bg-transparent'
                    }`,
                  )}
                  // @ts-ignore
                  width={`${part.hasRecord ? part.healthPercent : 0}%`}
                />
              </View>
            </View>
          ))}
        </View>
      </BaseCard>
    );
  },
);

export default PartsHealthCard;
