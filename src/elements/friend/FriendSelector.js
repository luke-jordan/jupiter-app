import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckBox, ListItem, Icon } from 'react-native-elements';

import { Colors } from '../../util/Values';
import { obtainColorForHeat } from '../../modules/friend/friend.helper';

export default class FriendSelector extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      friendSelection: {},
    };
  }

  async componentDidMount() {
    const { friendList } = this.props;
    const friendSelection = friendList.reduce((obj, friend) => ({ ...obj, [friend.relationshipId]: false }), {});
    friendSelection.SELF = true;
    this.setState({ friendSelection });
  }

  onToggleFriend = (friendshipId) => {
    console.log('AARARARSRRARS: ', friendshipId);
    if (friendshipId === 'SELF') {
      return; // nothing to do
    }
    const { friendSelection: priorSelection } = this.state;
    const friendSelection = { ...priorSelection };
    friendSelection[friendshipId] = !priorSelection[friendshipId];
    this.setState({ friendSelection });

    if (this.props.onToggleFriendship) {
      this.props.onToggleFriendship(friendshipId);
    }
  }

  renderFriend(friend) {
    const friendName = friend.relationshipId === 'SELF' ? 'You' :
      `${friend.calledName || friend.personalName} ${friend.familyName}`;

    return (
      <TouchableOpacity
        key={friend.relationshipId}
        onPress={() => this.onToggleFriend(friend.relationshipId)}
        disabled={friend.relationshipId === 'SELF'}
        style={styles.friendItemWrapper}
      >
        <CheckBox 
          checked={this.state.friendSelection && this.state.friendSelection[friend.relationshipId]}
          containerStyle={styles.friendCheckbox}
          checkedColor={Colors.PURPLE}
          onPress={() => this.onToggleFriend(friend.relationshipId)}
        />
        <Text style={styles.friendName}>
          {friendName}
        </Text>
        <View style={styles.friendItemHeat}>
          <Icon
            name="circle-o"
            type="font-awesome"
            size={30}
            color={obtainColorForHeat(friend.savingHeat)}
          />
        </View>
      </TouchableOpacity>
    );
  }
  
  render() {
    return (
      <View>
        {this.props.friendList.
          sort((friendA, friendB) => friendB.savingHeat - friendA.savingHeat).
          map((friend) => this.renderFriend(friend))}
      </View>
    )
  }
};

const styles = StyleSheet.create({
  friendItemWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    minWidth: '100%',
    minHeight: 55,
    marginTop: 5,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  friendName: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.DARK_GRAY,
  },
  friendItemHeat: {
    flexGrow: 1,
    alignItems: 'flex-end',
    paddingRight: 15,
  },
  friendCheckbox: {
    padding: 0,
  },
});
