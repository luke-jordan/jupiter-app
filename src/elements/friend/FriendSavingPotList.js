import React from 'react';

import moment from 'moment';

import { View, Text, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { Colors } from '../../util/Values';

const FriendSavingPotList = ({
  listContainerStyle,
  itemContainerStyle,
  savingPoolList,
  onPressPool,
}) => (
  <View style={listContainerStyle}>
    {savingPoolList && savingPoolList.map((savingPool) => (
      <ListItem 
        key={savingPool.savingPoolId}
        onPress={() => onPressPool(savingPool.savingPoolId)}
        containerStyle={itemContainerStyle}
        title={savingPool.poolName}
        titleStyle={styles.titleStyle}
        subtitle={`Created on ${moment(savingPool.creationTimeMillis).format('D MMM, YYYY')}`}
        subtitleStyle={styles.subtitleStyle}
        chevron={{ size: 30, color: Colors.MEDIUM_GRAY, name: "chevron-right", type: "evilicon" }}
        leftAvatar={{ source: require("../../../assets/piggy_bank.png") }}
        rightElement={(
          <Text style={styles.percentStyle}>{`${savingPool.percentComplete ? (savingPool.percentComplete * 100).toFixed(0) : 0}%`}</Text>
        )}
        underlayColor={Colors.WHITE}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  titleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.DARK_GRAY,
  },
  subtitleStyle: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.MEDIUM_GRAY,
  },
  percentStyle: {
    fontFamily: 'poppins-regular',
    color: Colors.PURPLE,
    fontSize: 15,
    // backgroundColor: Colors.PURPLE,
  },
})

export default FriendSavingPotList;
