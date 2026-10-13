import { Pressable, Text } from 'react-native';

// Labelled and has a role, but no accessibilityHint: not a finding.
export const Close = () => (
  <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => {}}>
    <Text>x</Text>
  </Pressable>
);

export const Unlabelled = () => (
  <Pressable onPress={() => {}}>
    <Text>x</Text>
  </Pressable>
);

export function useOnce(run: () => void) {
  // The project lints with react-hooks, which we do not load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  run();
}
