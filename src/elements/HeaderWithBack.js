import React from 'react';

import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

import { Colors } from '../util/Values';

const HeaderWithBack = ({ headerText, onPressBack }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={onPressBack}
    >
      <Icon
        name="chevron-left"
        type="evilicon"
        size={35}
        colors={Colors.MEDIUM_GRAY}
      />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{headerText}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 10,
  },
  headerTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
  },
})

export default HeaderWithBack;