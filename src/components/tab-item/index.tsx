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
  const color = (tw.color(active ? 'primary' : 'darkGrey') as string) || '#888';

  const renderIcon = () => {
    switch (title) {
      case 'HomeScreen':
        return <Home size={size} color={color} />;
      case 'GarageScreen':
        return <Bike size={size} color={color} />;
      case 'HistoryScreen':
        return <History size={size} color={color} />;
      case 'RemindersScreen':
        return <Bell size={size} color={color} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={tw.style('items-center mb-3')}
      onPress={onPress}
      onLongPress={onLongPress}>
      {renderIcon()}
    </TouchableOpacity>
  );
};

export default TabItem;
