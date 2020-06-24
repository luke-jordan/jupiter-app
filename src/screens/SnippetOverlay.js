import React from 'react';
import { connect } from 'react-redux';

import { View, Text, StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements';

const mapStateToProps = state => ({

});

const mapPropsToDispatch = {

}

class SnippetOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      title: '',
      body: '',
    }
  }

  async componentDidMount() {
    // select factoid to show
  }

  onPressClose = () => {

  }

  render() {
    return (
      <Overlay
        isVisible={this.props.isVisible}
        animationType="fade"
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

});

export default connect(mapStateToProps, mapPropsToDispatch)(SnippetOverlay);
