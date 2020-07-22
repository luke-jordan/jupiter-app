import React from 'react';
import { connect } from 'react-redux';

import { View, Text, StyleSheet, Dimensions } from 'react-native';

import { getSortedSnippets, FALLBACK_SNIPPET_ID } from '../modules/snippet/snippet.reducer';
import { incrementSnippetViewCount, updateAllSnippets, addSnippets } from '../modules/snippet/snippet.actions';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { postRequest, getRequest } from '../modules/auth/auth.helper';

import { LoggingUtil } from '../util/LoggingUtil';

import { Colors, Endpoints } from '../util/Values';

const { width } = Dimensions.get('window');

const mapStateToProps = state => ({
  snippets: getSortedSnippets(state),
  token: getAuthToken(state),
});

const mapPropsToDispatch = ({
  incrementSnippetViewCount,
  updateAllSnippets,
  addSnippets,
});

class SnippetOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      title: '',
      body: '',

      currentSnippet: {},
    }
  }

  async componentDidMount() {
    // select factoid to show
    // console.log('Snippets: ', this.props.snippets);
    const nextSnippet = this.props.snippets[0];
    this.setState({
      title: nextSnippet.title,
      body: nextSnippet.body,
      currentSnippet: nextSnippet,
      initiatedMillis: Date.now(),
    }, () => {
      LoggingUtil.logEvent('USER_VIEWED_SNIPPET', { snippetId: nextSnippet.snippetId });
      this.tellBackendSnippetViewed();   
    });
  }

  onPressClose = () => {
    if (this.state.initiatedMillis) {
      const timeViewed = (Date.now() - this.state.initiatedMillis) / 1000;
      LoggingUtil.logEvent('USER_CLOSED_SNIPPET', { snippetId: this.state.currentSnippet.snippetId, timeViewed });  
    }
    this.props.onCloseSnippet();
  }

  async tellBackendSnippetViewed() {
    const { snippetId } = this.state.currentSnippet;
    if (!snippetId || snippetId === FALLBACK_SNIPPET_ID) {
      await this.fetchSnippets();
      return;
    }

    this.props.incrementSnippetViewCount(snippetId);
    
    const url = `${Endpoints.CORE}snippet/update`;
    const params = { snippetId, status: 'VIEWED' };

    try {
      const result = await postRequest({ token: this.props.token, url, params });
      if (!result.ok) {
        console.log('Error updating snippet: ', JSON.stringify(result));
        return;
      }
      console.log('Result of telling backend snippet viewed: ', JSON.stringify(result));
    } catch (err) {
      console.log('Raw error updating backend on snippet view: ', JSON.stringify(err));
    }
      
    this.fetchSnippets();
  }

  // need to store last time here to avoid excessive calls
  async fetchSnippets() {
    const url = `${Endpoints.CORE}snippet/fetch`;
    try {
      const result = await getRequest({ token: this.props.token, url });
      if (!result.ok) {
        console.log('Error fetching snippets: ', JSON.stringify(result));
        return;
      }
      const { type, snippets } = await result.json();
      // console.log('Retrieved from server: ', snippets);
      if (type === 'ALL') {
        this.props.updateAllSnippets(snippets);
      }
      if (type === 'UNSEEN') {
        this.props.addSnippets(snippets);
      }
    } catch (err) {
      console.log('Error fetching snippets: ', err);
    }
  }

  render() {
    return (
      <View style={styles.snippetContainer}>
        <View style={styles.snippetHolder}>
          <Text style={styles.snippetTitle}>{this.state.title}</Text>
          <Text style={styles.snippetBody}>
            {this.state.body}
          </Text>
          <Text style={styles.snippetClose} onPress={this.onPressClose}>
            Close
          </Text>
        </View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  snippetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    paddingTop: 20,
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
