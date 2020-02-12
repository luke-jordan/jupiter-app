import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

const closeImage = require('../../../assets/close.png');
const tapToScreenImage = require('../../../assets/tapToScreen.png');

const BoostChallengeModal = ({ showModal, hideModal, startGame }) => (
  <View style={styles.backgroundWrapper}>
    <Modal
      animationType="slide"
      transparent
      visible={showModal}
      onRequestClose={() => {}}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.textTitle}>Boost Challenge Unlocked!</Text>
          <TouchableOpacity onPress={hideModal}>
            <Image source={closeImage} />
          </TouchableOpacity>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.content}>
            Your top up was successful and you now stand a chance to win R20.00.
            Follow the instructions below to play the game:
          </Text>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.instructionColorWrapper}>
            <View style={styles.instructionContent}>
              <Image
                style={{ width: 48, height: 48 }}
                source={tapToScreenImage}
              />
              <View style={styles.containerTapToScreen}>
                <Text style={styles.tapToScreen}>
                  Tap the screen as many times as you can in 20 seconds.
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Button
          title="START GAME"
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={startGame}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
        <TouchableOpacity style={styles.playLaterContainer}>
          <Text style={styles.playLaterContent}>Play Later</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  </View>
);

const styles = StyleSheet.create({
  backgroundWrapper: {
    position: 'absolute',
    opacity: 0.3,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.BLACK,
  },
  modalContainer: {
    marginTop: 'auto',
    marginHorizontal: 15,
    marginBottom: 'auto',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
  },
  textTitle: {
    color: Colors.DARK_GRAY,
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 21,
    paddingHorizontal: 16,
  },
  textContainer: {
    paddingHorizontal: 10,
    paddingTop: 18,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
  },
  instructionColorWrapper: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 17,
    width: '100%',
    borderRadius: 10,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  instructionContent: {
    flexDirection: 'row',
    width: '100%',
  },
  containerTapToScreen: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapToScreen: {
    fontSize: 14,
    fontWeight: 'bold',
    width: '100%',
    color: Colors.PURPLE,
  },
  buttonTitleStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 176,
  },
  buttonContainerStyle: {
    paddingTop: 18,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  playLaterContainer: {
    paddingTop: 17,
    paddingBottom: 27,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playLaterContent: {
    color: Colors.PURPLE,
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default BoostChallengeModal;
