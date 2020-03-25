import React from 'react';

import { View, Text, Image, TouchableOpacity, StyleSheet, Share, Clipboard, Linking, Dimensions } from 'react-native';

import { Colors, FallbackSupportNumber } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const BankDetailsDisplay = ({
  bankDetails,
  amountToAdd,
  humanReference,
  onCheckDone,
  containerStyle,
}) => {

  const onPressShare = async () => {
    try {
      await Share.share({
        message: `Jupiter Payment Details: Bank: ${bankDetails.bankName}; Beneficiary Name: ${bankDetails.beneficiaryName}; Account Type: Current/Cheque; Account Number: ${this.state.accountNumber}; Branch code: ${this.state.branchCode}`,
      });
    } catch (error) {
      console.log(error);
      // handle somehow?
    }
  };

  const onPressCopy = text => {
    Clipboard.setString(text);
    // this.toastRef.current.show('Copied to clipboard!');
  };

  const onPressSendPOP = () => {
    const defaultText = `Hi! I made a payment already for ${humanReference} - here is my proof of payment: `;
    const whatsAppLink = `https://wa.me/${FallbackSupportNumber.link}?text=${encodeURIComponent(defaultText)}`;
    Linking.openURL(whatsAppLink);
  };

  return (
    <View style={containerStyle}>
      <Text style={styles.boxTitle}>DETAILS FOR MANUAL EFT:</Text>
      <View style={styles.separator} />
      {amountToAdd && (
        <Text style={styles.boxText}>
          Amount: <Text style={styles.boldText}>R{amountToAdd}</Text>
        </Text>
      )}
      <Text style={styles.boxText}>
        Bank: <Text style={styles.boldText}>{bankDetails.bankName}</Text>
      </Text>
      <Text style={styles.boxText}>
        Account Name:{' '}
        <Text style={styles.boldText}>
          {bankDetails.beneficiaryName}
        </Text>
      </Text>
      <Text style={styles.boxText}>
        Account Type: <Text style={styles.boldText}>{bankDetails.accountType}</Text>
      </Text>
      <View style={styles.bottomRow}>
        <Text style={styles.boxText}>
          Account Number:{' '}
          <Text style={styles.boldText}>
            {bankDetails.accountNumber}
          </Text>
        </Text>
        <TouchableOpacity
          onPress={() => onPressCopy(bankDetails.accountNumber)}
        >
          <Image
            style={styles.copyIcon}
            source={require('../../assets/copy.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.boxText}>
          Branch code:{' '}
          <Text style={styles.boldText}>
            {bankDetails.routingNumber}
          </Text>
        </Text>
        <TouchableOpacity
          onPress={() => onPressCopy(bankDetails.routingNumber)}
        >
          <Image
            style={styles.copyIcon}
            source={require('../../assets/copy.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      {humanReference && (
        <View style={styles.bottomRow}>
          <Text style={styles.boxText}>
            Reference: <Text style={styles.boldText}>{humanReference}</Text>
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={onPressShare}
      >
        <Image
          style={styles.shareIcon}
          source={require('../../assets/share.png')}
          resizeMode="contain"
        />
        <Text style={styles.shareText}>Share payment Details</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={onPressSendPOP}
      >
        <Image
          style={styles.shareIcon}
          source={require('../../assets/message-circle.png')}
          resizeMode="contain"
        />
        <Text style={styles.shareText}>WhatsApp us proof of payment</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={onCheckDone}
      >
        <Image
          style={styles.shareIcon}
          source={require('../../assets/message-circle.png')}
          resizeMode="contain"
        />
        <Text style={styles.shareText}>Check payment complete</Text>
      </TouchableOpacity>
    </View>
  );

};

const styles = StyleSheet.create({
  boxContainer: {
    maxWidth: '100%',
  },
  boxTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.9 * FONT_UNIT,
    color: Colors.DARK_GRAY,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.GRAY,
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxText: {
    fontFamily: 'poppins-regular',
    width: '90%',
    color: Colors.MEDIUM_GRAY,
    marginVertical: 5,
  },
  boldText: {
    fontFamily: 'poppins-semibold',
    fontWeight: 'bold',
    color: Colors.DARK_GRAY,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  shareIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: Colors.PURPLE,
  },
  shareText: {
    fontFamily: 'poppins-regular',
    textDecorationLine: 'underline',
    color: Colors.PURPLE,
  },
});

export default BankDetailsDisplay;