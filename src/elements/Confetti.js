// largely based on this wonderful post: 
// https://engineering.shopify.com/blogs/engineering/building-arrives-confetti-in-react-native-with-reanimated

// however, react-native-reanimated has some pretty big performance issues, so re-engineered this to use plain animated

import React, { useMemo, useRef } from 'react';

import { View, Animated, Image, Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../util/Values';

import ConfettiImage from '../../assets/confetto.png';

// we don't allow screen rotation, so can be constant
const { width, height } = Dimensions.get('window');

const ANIMATION_DURATION = 1500; // roughly seems right
const INTERVAL_TIME = 75; // can adjust though
const DT = new Animated.Value(INTERVAL_TIME / 1000);

const NUM_CONFETTI = 10;
const COLORS = [Colors.GOLD, Colors.RED, Colors.PURPLE];
const CONFETTO_SIZE = 15;

const createConfetti = () => [...new Array(NUM_CONFETTI)].map((_, i) => ({
    key: i,
    x: new Animated.Value(width * (i % 2 ? 0.15 : 0.85) - CONFETTO_SIZE / 2),
    y: new Animated.Value(-60),
    angle: new Animated.Value(0),
    xVel: new Animated.Value(Math.random() * 400 - 200),
    yVel: new Animated.Value(Math.random() * 150 + 150),
    angleVel: new Animated.Value((Math.random() * 3 - 1.5) * Math.PI),
    color: COLORS[i % COLORS.length],
    delay: new Animated.Value(Math.floor(i / 10) * 0.3),
    elasticity: Math.random() * 0.3 + 0.1,
}));

const moveConfetto = (confetto) => {
  // const { x, y, angle, xVel, yVel, angleVel, delay, elasticity, clock } = confetto;
  if (confetto.delay > 0) {
    confetto.delay -= INTERVAL_TIME;
  }

  const { xVel, yVel, angleVel } = confetto;

  confetto.y = Animated.multiply(yVel, DT);
  confetto.x = Animated.multiply(xVel, DT);
  confetto.angle = Animated.multiply(angleVel, DT);

  if (confetto.x > (width - CONFETTO_SIZE) || confetto.x < 0) {
    confetto.x = confetto.x > 0 ? (width - CONFETTO_SIZE) : 0;
    confetto.xVel *= (-confetto.elasticity);
  }
};

const Confetti = ({ showConfetti }) => {
  console.log('*** SETTING UP CONFETTI :: ', (new Date()) / 1000, ' ** SHOW CONFETTI ? : ', showConfetti);
  const confetti = useMemo(createConfetti, []);



  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {confetti[0].map(({ key, x, y, angle, color }) => {
        return (
          <React.Fragment key={key}>
            <Animated.View
              key={key}
              style={[styles.confettiContainer, {
                transform: [{ translateX: x }, { translateY: y }, { rotate: angle }, { rotateX: angle }, { rotateY: angle }],
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
