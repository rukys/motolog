import React, { useMemo } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import tw from '../../../tailwind';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

interface CustomDiscreteSliderProps {
  min: number;
  max: number;
  step: number;
  stepLabel?: string;
  initialValue?: number;
  formatLabel?: (value: number) => string;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

const CustomDiscreteSlider: React.FC<CustomDiscreteSliderProps> = ({
  min,
  max,
  step,
  stepLabel = '',
  initialValue,
  formatLabel,
  disabled = false,
  onChange,
}) => {
  const sliderWidth = useSharedValue(0);
  const translateX = useSharedValue(0);

  const steps = useMemo(() => {
    const stepValues: number[] = [];
    for (let stepValue = min; stepValue <= max; stepValue += step) {
      stepValues.push(stepValue);
    }
    return stepValues;
  }, [min, max, step]);

  const totalSteps = steps.length - 1;

  const onLayout = (layoutEvent: LayoutChangeEvent) => {
    const width = layoutEvent.nativeEvent.layout.width;
    sliderWidth.value = width;

    if (initialValue !== undefined) {
      let initialStepIndex = steps.indexOf(initialValue);
      if (initialStepIndex === -1) {
        initialStepIndex = 0;
      }
      const stepWidth = width / totalSteps;
      translateX.value = initialStepIndex * stepWidth;
    }
  };

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (disabled) {
      return;
    }

    let newPosition = event.nativeEvent.translationX + translateX.value;
    newPosition = Math.max(0, Math.min(newPosition, sliderWidth.value));

    const stepWidth = sliderWidth.value / totalSteps;
    const snapped = Math.round(newPosition / stepWidth) * stepWidth;

    translateX.value = withSpring(snapped);

    const index = Math.round(snapped / stepWidth);
    const value = steps[index];

    if (onChange) {
      runOnJS(onChange)(value);
    }
  };

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const activeTrackStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  return (
    <View>
      <View style={tw.style('h-10 justify-center')} onLayout={onLayout}>
        <View
          style={tw.style('absolute h-1.5 w-full bg-secondary rounded-full')}
        />
        <Animated.View
          style={[
            tw.style('absolute h-1.5 bg-primary rounded-full'),
            activeTrackStyle,
          ]}
        />
        <PanGestureHandler enabled={!disabled} onGestureEvent={onGestureEvent}>
          <Animated.View
            style={[
              tw.style('absolute w-6 h-6 bg-primary rounded-full'),
              thumbStyle,
            ]}
          />
        </PanGestureHandler>
      </View>
      <View style={tw.style('flex-row justify-between mt-2')}>
        {steps.map((value, index) => (
          <Text key={index} style={tw.style('text-darkGrey text-xs')}>
            {formatLabel ? formatLabel(value) : value} {stepLabel}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default CustomDiscreteSlider;
