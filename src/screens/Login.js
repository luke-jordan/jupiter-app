import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage } from 'react-native';
import { Colors } from '../util/Values';

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {

  }

  render() {
    return (
      <View style={styles.container}>

      </View>
    );
  }
}

// </Mutation>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
