import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../../../tailwind';
import { Wrench } from 'lucide-react-native';

export default function DiagnosticCard({
  symptom,
  question,
  options = [],
  onSelectOption,
}) {
  const [selected, setSelected] = useState(null);

  const handleSelect = option => {
    if (selected) {
      return;
    } // Prevent multiple clicks
    setSelected(option);
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  return (
    <View
      style={tw.style(
        'mt-2 bg-dark border border-primary/30 rounded-xl overflow-hidden w-64',
      )}>
      {/* Header */}
      <View
        style={tw.style(
          'p-3 bg-secondary/80 border-b border-white/5 flex-row items-center',
        )}>
        <View
          style={tw.style(
            'bg-darkGrey rounded-full w-8 h-8 items-center justify-center mr-2',
          )}>
          <Wrench size={14} color={tw.color('white')} />
        </View>
        <View style={tw.style('flex-1')}>
          <Text style={tw.style('text-white/60 font-montserrat text-[10px]')}>
            Diagnostic Mode
          </Text>
          <Text
            style={tw.style('text-white font-montserratBold text-sm')}
            numberOfLines={1}>
            {symptom || 'Mekanik Pintar'}
          </Text>
        </View>
      </View>

      <View style={tw.style('p-4')}>
        <Text
          style={tw.style('text-white font-montserrat text-sm leading-5 mb-4')}>
          {question}
        </Text>

        <View style={tw.style('flex-row flex-wrap gap-2')}>
          {options.map((option, index) => {
            const isSelected = selected === option;
            const isOtherSelected = selected && selected !== option;

            return (
              <TouchableOpacity
                key={index}
                disabled={!!selected}
                onPress={() => handleSelect(option)}
                style={tw.style(
                  'px-3 py-2 rounded-lg border flex-row items-center',
                  isSelected
                    ? 'bg-primary border-primary'
                    : isOtherSelected
                    ? 'bg-darkGrey border-white/10 opacity-50'
                    : 'bg-secondary/80 border-primary/30',
                )}>
                <Text
                  style={tw.style(
                    'font-montserratSemiBold text-xs',
                    isSelected ? 'text-white' : 'text-white/80',
                  )}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
