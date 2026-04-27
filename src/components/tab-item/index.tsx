import { Bell, Bike, History, Home } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import tw from '../../../tailwind';

interface TabItemProps {
  title: string;
  active: boolean;
  size: number;
  onPress: () => void;
  onLongPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({
  title,
  active,
  size,
  onPress,
  onLongPress,
}) => {
  const Icon = () => {
    const color = (tw.color(active ? 'primary' : 'darkGrey') as string) || '#888';

    if (title === 'HomeScreen') {
      return <Home size={size} color={color} />;
    }
    if (title === 'GarageScreen') {
      return <Bike size={size} color={color} />;
    }
    if (title === 'HistoryScreen') {
      return <History size={size} color={color} />;
    }
    if (title === 'RemindersScreen') {
      return <Bell size={size} color={color} />;
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={tw.style('items-center mb-3')}
      onPress={onPress}
      onLongPress={onLongPress}>
      <Icon />
    </TouchableOpacity>
  );
};

export default TabItem;
