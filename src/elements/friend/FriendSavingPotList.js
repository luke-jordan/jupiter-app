import React from 'react';

import moment from 'moment';

import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

import { Colors } from '../../util/Values';

const FriendSavingPotList = (
  containerStyle,
  titleStyle,
  subtitleStyle,
  savingPoolList,
  onPressPool
) => (
  <>
    {savingPoolList.map((savingPool) => (
      <TouchableOpacity style={containerStyle} onPress={() => onPressPool(savingPool.savingPoolId)}>
        <View>
          <Text style={titleStyle}>{savingPool.poolName}</Text>
          <Text style={subtitleStyle}>Created on {moment(savingPool.creationTimeMillis).format('dd MMM, YYY')}</Text>
        </View>
        <Text>{savingPool.percentComplete ? (savingPool.percentComplete * 100).toFixed(0) : 0}%</Text>
        <Icon
          name="chevron-right"
          type="evilicon"
          size={30}
          color={Colors.MEDIUM_GRAY}
        />
      </TouchableOpacity>
    ))}
  </>
);

export default FriendSavingPotList;