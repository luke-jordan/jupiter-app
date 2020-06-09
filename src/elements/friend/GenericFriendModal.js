import React from 'react';

import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Overlay, Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

const GenericFriendModal = ({ isVisible, heading, bodyContent, buttonTitle, onPressButton, onPressClose, buttonLoading }) => 
  (
    <Overlay
      isVisible={isVisible}
      animationType="fade"
      onBackdropPress={onPressClose}
      width="90%"
      height="auto"
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalHeader}>{heading}</Text>
        {bodyContent}
        <Button
          title={buttonTitle}
          onPress={onPressButton}
          loading={buttonLoading}
          titleStyle={styles.addSavingBtnTitle}
          buttonStyle={styles.addSavingBtnStyle}
          containerStyle={styles.addSavingBtnContainerStyle}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
        <Text style={styles.modalFooterLink} onPress={onPressClose}>
          Cancel
        </Text>

        <TouchableOpacity style={styles.closeDialog} onPress={onPressClose}>
          <Image source={require('../../../assets/close.png')} resizeMode="contain" style={{ width: 25 }} />
        </TouchableOpacity>

      </View>
    </Overlay>
  );

const styles = StyleSheet.create({
  modalContainer: {
    marginTop: 'auto',
    // marginHorizontal: 15,
    marginBottom: 'auto',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },  
  modalHeader: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    lineHeight: 28,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  modalFooterLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    textDecorationLine: 'underline',
    color: Colors.PURPLE,
    width: '100%',
    textAlign: 'center',
  },
  closeDialog: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  addSavingBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.WHITE,
  },
  addSavingBtnStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  addSavingBtnContainerStyle: {
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
    width: '100%',
  },
});

export default GenericFriendModal;
