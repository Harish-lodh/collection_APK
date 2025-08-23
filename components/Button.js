import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function Button({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#2f6fed', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center' },
  pressed: { opacity: 0.9 },
  text: { color: '#fff', fontWeight: '700' },
});
