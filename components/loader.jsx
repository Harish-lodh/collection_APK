import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

export default function Loader({
  visible = false,
  size = 90,
  color = "#333",
  spokes = 8,
  duration = 900,
  overlayColor = "rgba(255,255,255,0.6)",
}) {
  const animations = useRef(
    [...Array(spokes)].map(() => new Animated.Value(0.15))
  ).current;

  useEffect(() => {
    animations.forEach((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.15,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      );

      setTimeout(() => loop.start(), (duration / spokes) * i);
    });
  }, [animations, duration, spokes]);

  if (!visible) return null;

  const spokeWidth = size * 0.10;
  const spokeHeight = size * 0.25;
  const radius = size / 2 - spokeHeight; // how far spokes are from center

  return (
    <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
      <View style={{ width: size, height: size }}>
        {animations.map((anim, i) => {
          const rotate = (360 / spokes) * i;
          return (
            <View
              key={i}
              style={[
                styles.spokeWrapper,
                {
                  transform: [
                    { rotate: `${rotate}deg` },
                    { translateY: -radius }, // pushes spoke outward
                  ],
                },
              ]}
            >
              <Animated.View
                style={{
                  width: spokeWidth,
                  height: spokeHeight,
                  borderRadius: spokeWidth / 2,
                  backgroundColor: color,
                  opacity: anim,
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  spokeWrapper: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -3, // adjust horizontally
    marginTop: -3,  // adjust vertically
  },
});
