import React from 'react';

import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements';

import { Colors } from '../../util/Values';

export default class FriendFeatureIntroModal extends React.PureComponent {

  renderBodyText = (text, index) => (
    <Text style={styles.modalBodyText} key={index}>
      {text}
    </Text>
  )

  render() {

    return (
      <Overlay
        isVisible={this.props.isVisible}
        animationType="fade"
        width="90%"
        height="auto"
        onRequestClose={this.props.onRequestClose}
        onBackdropPress={this.props.onRequestClose}
      >
        <View style={styles.modalContainer}>
          <Image 
            source={require('../../../assets/clapping-hands.png')} 
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.modalHeader}>
            {this.props.featureTitle}
          </Text>

          {this.props.bodyParas.map((text, index) => this.renderBodyText(text, index))}

          {this.props.highlightPara && (
            <Text style={styles.modalHighlightText}>{this.props.highlightPara}</Text>
          )}

          <TouchableOpacity style={styles.footerLink} onPress={this.props.onRequestClose}>
            <Text style={styles.footerLinkText}>Got it</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeDialog} onPress={this.props.onRequestClose}>
            <Image source={require('../../../assets/close.png')} resizeMode="contain" style={{ width: 25 }} />
          </TouchableOpacity>
        </View>
      </Overlay>
    )
  }

}

const styles = StyleSheet.create({
  modalContainer: {
    marginTop: 'auto',
    marginHorizontal: 15,
    marginBottom: 'auto',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },  
  image: {
    width: 162,
    height: 81,
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
  modalBodyText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalHighlightText: {
    padding: 10,
    textAlign: 'center',
    backgroundColor: Colors.PURPLE_TRANSPARENT,
    width: '90%',
    borderRadius: 10,

    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'poppins-regular',
    color: Colors.PURPLE,
  },
  footerLink: {
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  footerLinkText: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    textDecorationLine: 'underline',
    color: Colors.PURPLE,
  },
  closeDialog: {
    position: 'absolute',
    top: 0,
    right: 0,
  },

});
