import React from 'react';
import { connect } from 'react-redux';

import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Overlay } from 'react-native-elements';

import { Colors } from '../util/Values';

const { width, height } = Dimensions.get('window');

const mapStateToProps = state => ({

});

const mapPropsToDispatch = {

}

class SnippetOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      title: 'Did you know?',
      body: 'Put R50 a month into Jupiter, and by year 3 your interest will buy you a Streetwise Bucket! Compound interest-finger licking good',
    }
  }

  async componentDidMount() {
    // select factoid to show
  }

  onPressClose = () => {
    // tell backend, maybe include a time
    this.props.onCloseSnippet();
  }

  render() {
    return (
      <Overlay
        isVisible={this.props.isVisible}
        animationType="fade"
        fullScreen
        overlayStyle={styles.snippetContainer}
        overlayBackgroundColor='transparent'
        onBackdropPress={this.onPressClose}
      >
        <View style={styles.snippetHolder}>
          <Text style={styles.snippetTitle}>{this.state.title}</Text>
          <Text style={styles.snippetBody}>
            {this.state.body}
          </Text>
          <Text style={styles.snippetClose} onPress={this.onPressClose}>
            Close
          </Text>
        </View>
      </Overlay>
    )
  }

}

const styles = StyleSheet.create({
  snippetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    paddingBottom: height * 0.03,
  },
  snippetHolder: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    height: width * 0.8,
    width: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  snippetTitle: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PURPLE,
    marginBottom: 8,
  },
  snippetBody: {
    width: '75%',
    textAlign: 'center',
    fontFamily: 'poppins-regular',
    fontSize: 14,
    lineHeight: 19,
    color: Colors.MEDIUM_GRAY,
  },
  snippetClose: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PURPLE,
    textDecorationLine: 'underline',
    marginTop: 25,
  },
});

export default connect(mapStateToProps, mapPropsToDispatch)(SnippetOverlay);
