import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';

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
    this.setState({ friendSelection });
  }

  onToggleFriend = (friendshipId) => {
    const { friendSelection: priorSelection } =this.state;
    const friendSelection = { ...priorSelection };
    friendSelection[friendshipId] = !priorSelection[friendshipId];
    this.setState({ friendSelection });
  }

  renderFriend(friend) {
    return (
      <TouchableOpacity
        key={friend.relationshipId}
        onPress={() => this.onToggleFriend(friend.relationshipId)}
      >
        <CheckBox 
          checked={this.state.friendSelection[friend.relationshipId]}
        />
        <Text>{friend.calledName || friend.personalName} {friend.familyName}</Text>
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
        {this.props.friendList.map(this.renderFriend)}
      </View>
    )
  }
};

const styles = StyleSheet.create({

});
