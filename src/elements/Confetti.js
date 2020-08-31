// largely bsaed on this wonderful post: 
// https://engineering.shopify.com/blogs/engineering/building-arrives-confetti-in-react-native-with-reanimated

import React, { useMemo } from 'react';

import Animated from 'react-native-reanimated';
import { View, Image, Dimensions, StyleSheet } from 'react-native';
import ConfettiImage from '../../assets/confetto.png';

import { Colors } from '../util/Values';

const NUM_CONFETTI = 100;
const COLORS = [Colors.GOLD, Colors.PURPLE, Colors.GREEN];
const CONFETTO_SIZE = 20;

// we don't allow rotation, so can be constant
const { width, height } = Dimensions.get('window');

const createConfetti = () => {
  const clock = new Animated.Clock();

  return [...new Array(NUM_CONFETTI)].map((_, i) => ({
    key: i,
    x: new Animated.Value(width * 0.5 - CONFETTO_SIZE / 2),
    y: new Animated.Value(-60),
    angle: new Animated.Value(0),
    xVel: new Animated.Value(Math.random() * 400 - 200),
    yVel: new Animated.Value(Math.random() * 150 + 150),
    angleVel: new Animated.Value((Math.random() * 3 - 1.5) * Math.PI),
    color: COLORS[i % COLORS.length],
    clock,
  }));
}

const Confetti = () => {
  const confetti = useMemo(createConfetti, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {confetti.map(({ key, x, y, angle, color, xVel, yVel, angleVel, clock }) => {
        return (
          <React.Fragment key={key}>
            <Animated.Code>
              {() => {
                const { startClock, set, add, divide, diff, multiply, cond, clockRunning } = Animated;

                const timeDiff = diff(clock);
                const dt = divide(timeDiff, 1000);
                const dy = multiply(dt, yVel);
                const dx = multiply(dt, xVel);
                const dAngle = multiply(dt, angleVel);

                return cond(
                  clockRunning(clock),
                  [
                    set(y, add(y, dy)),
                    set(x, add(x, dx)),
                    set(angle, add(angle, dAngle)),
                  ],
                  [startClock(clock), timeDiff]
                )
              }}
            </Animated.Code>
            <Animated.View
              key={key}
              style={[styles.confettiContainer, {
                transform: [{ translateX: x }, { translateY: y }, { rotate: angle }],
              }]}
            >
              <Image source={ConfettiImage} tintColor={color} style={styles.confetti} />
            </Animated.View>
          </React.Fragment>
        )
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  confetti: {
    width: CONFETTO_SIZE,
    height: CONFETTO_SIZE,
  },
});

export default Confetti;
