import React from 'react';
import { connect } from 'react-redux';

import { View, StyleSheet } from 'react-native';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getFriendSavingPools } from '../modules/friend/friend.reducer';

import { friendService } from '../modules/friend/friend.service';

const mapStateToProps = state => ({
  token: getAuthToken(state),
  savingPools: getFriendSavingPools(state),
});

const mapPropsToDispatch = {

}

class ViewSavingPool extends React.Component {
  
  renderFriends() {

  }

  renderTransactions() {
    
  }
  
  render() {
    return (
      <View style={styles.container}>
        
      </View>
    )
  }
}

const styles = StyleSheet.create({

});

export default connect(mapStateToProps, mapPropsToDispatch)(ViewSavingPool);