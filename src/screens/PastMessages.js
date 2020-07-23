/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';

import { connect } from 'react-redux';
import moment from 'moment';

import {
  ActivityIndicator,
  AsyncStorage,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import HeaderWithBack from '../elements/HeaderWithBack';

import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getCurrentServerBalanceFull } from '../modules/balance/balance.reducer';

import getMessageCardIcon from '../modules/boost/helpers/getMessageIcon';
import getMessageCardButtonText from '../modules/boost/helpers/getMessageButtonText';
import handleMessageActionPress from '../modules/boost/helpers/handleMessageActionPress';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
  currentBalance: getCurrentServerBalanceFull(state),
});

class PastMessages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_MESSAGE_HISTORY');

    // as with boosts, these long lists are not necessary to get in the way of state hydration/dehydration
    let messages = await AsyncStorage.getItem('userMessages');
    if (messages) {
      messages = JSON.parse(messages);
      this.setState({
        messages,
        loading: false,
      });
    }
    this.fetchMessages();
  }

  sortMessages = messages => {
    const sortByTime = (a, b) => moment(b.startTime).isAfter(moment(a.startTime)) && 1;
    return messages.sort(sortByTime);
  };

  fetchMessages = async () => {
    try {
      const result = await fetch(`${Endpoints.CORE}message/history`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'GET',
      });

      if (result.ok) {
        const resultJson = await result.json();
        // console.log('AND, MESSAGES: ', resultJson);
        const messages = this.sortMessages(resultJson);
        this.setState({
          messages,
          loading: false,
        });
        AsyncStorage.setItem('userMessages', JSON.stringify(messages));
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  onPressActionButton = (userMessage) => {
    handleMessageActionPress(userMessage, this.props.navigation, this.props.currentBalance);
  }

  onPressAddCash = amount => this.props.navigation.navigate('AddCash', { preFilledAmount: amount, startNewTransaction: true });

  renderMessages() {
    return (
      <View style={styles.cardsWrapper}>
        {this.state.messages.map((item, index) =>
          this.renderMessageCard(item, index)
        )}
      </View>
    );
  }

  renderMessageCard(userMessage) {
    
    const messageAction = userMessage.actionContext ? userMessage.actionContext.actionToTake : 'UNKNOWN';
    const messageActionText = getMessageCardButtonText(messageAction);
    const messageBody = userMessage.displayedBody.replace(/\n\s*\n/g, '\n');
    const messageDate = moment(userMessage.startTime).format('DD MMM YYYY');

    return (
      <View style={styles.messageCard} key={userMessage.messageId}>
        <View style={styles.messageCardHeader}>
          <Image
            style={styles.messageCardIcon}
            source={getMessageCardIcon(userMessage.display.iconType)}
          />
          <Text style={styles.messageCardTitle}>
            {userMessage.messageTitle}
          </Text>
        </View>
        <View style={{ maxWidth: '100%' }}>
          <Text style={styles.messageCardText}>{messageBody}</Text>
        </View>
        <View style={styles.messageCardFooter}>
          <Text style={styles.messageDate}>
            {messageDate}
          </Text>
          {messageActionText && messageActionText.length > 0 ? (
            <TouchableOpacity
              style={styles.messageCardButton}
              onPress={() => this.onPressActionButton(userMessage)}
            >
              <Text style={styles.messageCardButtonText}>
                {messageActionText}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  renderEmptyMessageCard() {
    return (
      <View style={styles.messageCard}>
        <View style={styles.messageCardHeader}>
          <Text style={styles.messageCardTitle}>This is your 📚 Messages Tab</Text>
        </View>
        <View style={{ maxWidth: '100%'}}>
          <Text style={styles.messageCardText}>
            In here, you’ll find all the news, information and Money-tips from Jupiter in this part of your App. Each morning, you’ll be able to read a 1-minute summary of money news in the popular Jupiter Roundup 🌍
            {'\n\n'}
            Keep checking your Message tab often for more news &amp; info!
          </Text>
        </View>
      </View>
    )
  }

  renderMainContent() {
    return (
      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.mainContent}
        >
          {this.state.messages && this.state.messages.length > 0 ? this.renderMessages() : this.renderEmptyMessageCard()}
        </ScrollView>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderWithBack
          headerText="Messages"
          onPressBack={() => this.props.navigation.goBack()}
        />
        {this.state.loading ? (
          <View style={styles.contentWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
          </View>
        ) : (
          this.renderMainContent()
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scrollView: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    width: '100%',
    paddingHorizontal: 15,
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageCard: {
    backgroundColor: Colors.WHITE,
    marginVertical: 12,
    padding: 16,
    minWidth: '100%',
    maxWidth: '100%',
    borderRadius: 4,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  messageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    maxWidth: '100%',
  },
  messageCardIcon: {
    marginEnd: 10,
  },
  messageCardTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.DARK_GRAY,
    maxWidth: '100%',
  },
  messageCardText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
  },
  messageCardFooter: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  messageDate: {
    textAlign: 'left',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
  },
  messageCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 10,
    flexGrow: 5,
  },
  messageCardButtonText: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.7 * FONT_UNIT,
    color: Colors.PURPLE,
    padding: 10,
    paddingBottom: 6,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: Colors.PURPLE,
    borderRadius: 4,
  },
});

export default connect(mapStateToProps)(PastMessages);
