import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function useAnimatedPress(scaleDown = 0.97) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(scaleDown, { damping: 15, stiffness: 150 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return { animatedStyle, onPressIn, onPressOut };
}
