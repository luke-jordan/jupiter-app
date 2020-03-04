import React from 'react';

import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Button, Overlay } from 'react-native-elements';

import { Colors } from '../util/Values';

const UpdateModal = ({
    updateRequiredDialogVisible,
    updateAvailableDialogVisible,
    onPressUpdate,
    onCloseDialog,
}) => {

    return (
      <>
        <Overlay
          isVisible={updateRequiredDialogVisible}
          height="auto"
          width="auto"
        >
          <View style={styles.helpDialog}>
            <Text style={styles.helpTitle}>Update Required</Text>
            <Text style={styles.helpContent}>
                We&apos;ve made some big changes to the app,(more than usual).
                Please update to activate the new features. This version will no
                longer be supported in the future.
            </Text>
            <View style={styles.dialogBottomRight}>
              <Button
                title="UPDATE NOW"
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={onPressUpdate}
                linearGradientProps={{
                    colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                    start: { x: 0, y: 0.5 },
                    end: { x: 1, y: 0.5 },
                    }}
              />
            </View>
          </View>
        </Overlay>

        <Overlay
          isVisible={updateAvailableDialogVisible}
          height="auto"
          width="auto"
          onBackdropPress={onCloseDialog}
          onHardwareBackPress={onCloseDialog}
        >
          <View style={styles.helpDialog}>
            <Text style={styles.helpTitle}>New Features!</Text>
            <Text style={styles.helpContent}>
                We&apos;ve made some changes to the app. Please update to activate
                the new features.
            </Text>
            {/*
            <Text style={styles.helpContent}>
            Grow your savings even more with these new features on Jupiter:
            </Text>
            <View style={styles.updateFeatureItem}>
            <Icon
                name='check'
                type='feather'
                size={28}
                color={Colors.PURPLE}
            />
            <Text style={styles.updateFeatureItemText}>
                <Text style={styles.updateFeatureItemBold}>BOOSTS</Text> - Earn rewards to boost your savings even more!
            </Text>
            </View>
            <View style={styles.updateFeatureItem}>
            <Icon
                name='check'
                type='feather'
                size={28}
                color={Colors.PURPLE}
            />
            <Text style={styles.updateFeatureItemText}>
                <Text style={styles.updateFeatureItemBold}>SAVING HISTORY</Text> - Keep track of all your savings, with a full history view.
            </Text>
            </View>
            */}
            <View style={styles.dialogBottomLine}>
              <Text style={styles.helpLink} onPress={onCloseDialog}>
                Later
              </Text>
              <Button
                title="UPDATE NOW"
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={onPressUpdate}
                linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
                }}
              />
            </View>
            <TouchableOpacity style={styles.closeDialog} onPress={onCloseDialog}>
              <Image source={require('../../assets/close.png')} />
            </TouchableOpacity>
          </View>
        </Overlay>
      </>
    )
};

const styles = StyleSheet.create({  
  helpDialog: {
    width: '90%',
    minHeight: 340,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  helpTitle: {
    textAlign: 'left',
    fontFamily: 'poppins-semibold',
    fontSize: 19,
  },
  helpContent: {
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 16,
    lineHeight: 20,
  },
  helpLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.PURPLE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  closeDialog: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  dialogBottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogBottomRight: {
    alignItems: 'flex-end',
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: Colors.WHITE,
    marginHorizontal: 15,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
  },
  buttonContainerStyle: {
    justifyContent: 'center',
  },
});

export default UpdateModal;