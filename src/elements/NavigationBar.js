import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage } from 'react-native';

export default class NavigationBar extends React.Component {

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
    height: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
