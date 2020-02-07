import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';
import { BoostStatus } from '../../modules/boost/models/index';

const DEFAULT_TITLES = {
    [BoostStatus.REDEEMED]: 'Congratulations!',
};

const DEFAULT_BODY = {
    [BoostStatus.REDEEMED]: 'You’ve successfully completed the challenge and have won #{boostAwardedAmount}!\nKeep being the speedy, smart saver you are to get a chance to unlock further boost challenges and save even more.',
};

const BoostResultModal = ({
  showModal,
  hideModal,
  newStatus,
  boostMessage,
  boostParamaters,
  navigation,
}) => {

    let title = '';
    let body = '';

    if (boostMessage) {
        title = boostMessage.title || DEFAULT_TITLES[newStatus];
        body = boostMessage.body || DEFAULT_BODY[newStatus];
    } else {
        title = DEFAULT_TITLES[newStatus];
        body = DEFAULT_BODY[newStatus];
    }

    
    
    return (
      <View style={styles.backgroundWrapper}>
        <Modal
          animationType="slide"
          transparent
          visible={showModal}
          onRequestClose={() => {}}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.textTitle}>{title}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.content}>{body}</Text>
            </View>
            <Button
              title={buttonLabel}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={() => onPressHandler(navigation, hideModal)}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
                }}
            />
            <TouchableOpacity
              style={styles.playLaterContainer}
              onPress={hideModal}
            >
              <Text style={styles.playLaterContent}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
};

BoostResultModal.defaultProps = {
  boostMessage: {
    title: 'Get a reward today',
    body:
      'Save R100 before the end of today and you will be rewarded with R10. Save now to claim!',
    actionToTake: 'ADD_CASH',
  },
};

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
    justifyContent: 'center',
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

export default BoostResultModal;
