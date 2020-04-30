import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, Input } from 'react-native-elements';

import { Colors } from '../util/Values';

import { friendService } from '../modules/friend/friend.service';

class AddFriend extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      token: props.token,
      emailOrPhoneToAdd: '',
    }
  };

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onChangeInput = (text) => {
    this.setState({ emailOrPhoneToAdd: text });
  }

  onChangeInputEnd = () => {
    console.log('PRESSED!!!');
  }

  async searchForUser() {
    friendService.initiateFriendRequest({ token: this.state.token });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.onPressBack}
          >
            <Icon
              name="chevron-left"
              type="evilicon"
              size={35}
              colors={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Saving Buddies</Text>
        </View>
        <View style={styles.mainBody}>
          <Input 
            value={this.state.emailOrPhoneToAdd}
            onChangeText={text => this.onChangeInputEnd(text)}
            onEndEditing={this.onChangeInputEnd}
            leftIcon={(
              <Icon
                name="search"
                type="evilicons"
                color={Colors.PURPLE}
                onPress={this.onChangeInputEnd}
              />
            )}
            placeholder="Add Email Address or Phone Number"
            containerStyle={styles.inputWrapperStyle}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
          />
          <Text style={styles.referralNote}>
            Or simply share the referral code below
          </Text>
          <TouchableOpacity style={styles.referralCode}>
            <Text style={styles.referralCodeText}>MEMORY</Text>
            <Icon
              name="copy"
              type="font-awesome"
              size={22}
              color={Colors.PURPLE}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.footerWrapper}>
          <View style={styles.rewardWrapper}>
            <Text style={styles.rewardText}>Invite a buddy and we&apos;ll reward you!</Text>
          </View>
          <Text style={styles.rewardDescription}>
            If they&apos;re new to Jupiter, we’ll add R20.00 to your balance each time a buddy signs up and completes 
            their first save. 
          </Text>
        </View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
    paddingBottom: 20,
  },
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
  mainBody: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
    paddingHorizontal: 15,
  },
  inputWrapperStyle: {
    marginTop: 20,
    backgroundColor: Colors.WHITE,
    minHeight: 50,
    borderRadius: 10,
    paddingVertical: 10,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    backgroundColor: Colors.WHITE,
    fontFamily: 'poppins-regular',
    fontSize: 13,
    marginLeft: 5,
  },
  footerWrapper: {
    paddingHorizontal: 15,
  },
  rewardWrapper: {
    backgroundColor: Colors.PURPLE_TRANSPARENT,
    paddingLeft: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  rewardText: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.PURPLE,
  },
  rewardDescription: {
    backgroundColor: Colors.WHITE,
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: Colors.MEDIUM_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  referralNote: {
    marginTop: 15,
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    width: '100%',
    textAlign: 'center',
  },
  referralCode: {
    marginTop: 5,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  referralCodeText: {
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    marginRight: 5,
  },
});

export default AddFriend;