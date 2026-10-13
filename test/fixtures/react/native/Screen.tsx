import { TouchableOpacity, Text, View } from 'react-native';

export function Screen() {
  return (
    <View>
      <TouchableOpacity onPress={() => {}}>
        <Text>Go</Text>
      </TouchableOpacity>
      <View accessibilityRole="notarole" />
    </View>
  );
}
