import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import tw from '../../../tailwind';
import { TrendingUp } from 'lucide-react-native';

const COLOR_PALETTE = [
  'bg-blue-500',
  'bg-primary',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-error',
];

export default function ExpenseAnalyticsCard({ services = [] }) {
  const { total, breakdown } = useMemo(() => {
    let totalCost = 0;
    const categoryMap = {};

    services.forEach(serviceRecord => {
      const cost = serviceRecord.cost || 0;
      if (cost <= 0) {
        return;
      }

      totalCost += cost;

      // Simplistic categorization based on keywords
      const typeStr = serviceRecord.serviceType
        ? serviceRecord.serviceType.toLowerCase()
        : 'lainnya';
      let category = 'Lainnya';

      if (
        typeStr.includes('bensin') ||
        typeStr.includes('bbm') ||
        typeStr.includes('gas')
      ) {
        category = 'Bensin';
      } else if (typeStr.includes('oli')) {
        category = 'Oli';
      } else if (typeStr.includes('servis') || typeStr.includes('tune')) {
        category = 'Servis Rutin';
      } else if (
        typeStr.includes('ganti') ||
        typeStr.includes('part') ||
        typeStr.includes('kampas') ||
        typeStr.includes('ban')
      ) {
        category = 'Ganti Part';
      } else {
        category = serviceRecord.serviceType || 'Lainnya'; // Use raw string if short, else fallback
      }

      if (category.length > 15) {
        category = 'Lainnya';
      } // Prevent super long category names

      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += cost;
    });

    // Convert map to sorted array
    const breakdownArray = Object.keys(categoryMap)
      .map((categoryName, index) => ({
        label: categoryName,
        amount: categoryMap[categoryName],
        percentage:
          totalCost > 0 ? (categoryMap[categoryName] / totalCost) * 100 : 0,
        colorClass: COLOR_PALETTE[index % COLOR_PALETTE.length],
      }))
      .sort((a, b) => b.amount - a.amount);

    return { total: totalCost, breakdown: breakdownArray };
  }, [services]);

  if (total === 0) {
    return (
      <View
        style={tw.style(
          'mt-4 bg-dark border border-primary/30 rounded-xl p-4 w-64',
        )}>
        <Text
          style={tw.style('text-white/60 font-montserrat text-xs text-center')}>
          Belum ada rekap pengeluaran untuk motor ini.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={tw.style(
        'mt-4 bg-dark border border-primary/30 rounded-xl overflow-hidden w-64',
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
          <TrendingUp size={14} color={tw.color('white')} />
        </View>
        <View>
          <Text style={tw.style('text-white/60 font-montserrat text-xs')}>
            Total Pengeluaran
          </Text>
          <Text style={tw.style('text-white font-montserratBold text-sm')}>
            Rp {total.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      <View style={tw.style('p-4')}>
        {/* Stacked Bar Chart */}
        <View
          style={tw.style(
            'h-3 w-full rounded-full flex-row overflow-hidden mb-4',
          )}>
          {breakdown.map((categoryItem, index) => (
            <View
              key={index}
              style={tw.style(`h-full ${categoryItem.colorClass}`, {
                width: `${categoryItem.percentage}%`,
              })}
            />
          ))}
        </View>

        {/* Legend */}
        <View style={tw.style('flex-col gap-2')}>
          {breakdown.map((categoryItem, index) => (
            <View
              key={index}
              style={tw.style('flex-row items-center justify-between')}>
              <View style={tw.style('flex-row items-center')}>
                <View
                  style={tw.style(
                    `w-2.5 h-2.5 rounded-full mr-2 ${categoryItem.colorClass}`,
                  )}
                />
                <Text
                  style={tw.style('text-white/80 font-montserrat text-xs')}
                  numberOfLines={1}>
                  {categoryItem.label}
                </Text>
              </View>
              <View style={tw.style('flex-row items-center')}>
                <Text
                  style={tw.style(
                    'text-white font-montserratSemiBold text-xs mr-2',
                  )}>
                  Rp {categoryItem.amount.toLocaleString('id-ID')}
                </Text>
                <Text
                  style={tw.style(
                    'text-white/40 font-montserrat text-[10px] w-8 text-right',
                  )}>
                  {Math.round(categoryItem.percentage)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
