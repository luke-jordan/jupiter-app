import moment from 'moment';
import React from 'react';
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
import { Button } from 'react-native-elements';

import BoostInstructionModal from '../components/BoostInstructionModal';
import NavigationBar from '../../../elements/NavigationBar';
import getPermittedTypesOfBoost from '../helpers/getPermittedTypesOfBoost';
import { BoostStatus } from '../models';
import { LoggingUtil } from '../../../util/LoggingUtil';
import { NavigationUtil } from '../../../util/NavigationUtil';
import { Sizes, Endpoints, Colors } from '../../../util/Values';
import { MessagingUtil } from '../../../util/MessagingUtil';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

class Boosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_BOOST_LIST');
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
    }
    const { token } = info;

    let boosts = await AsyncStorage.getItem('userBoosts');
    if (boosts) {
      boosts = JSON.parse(boosts);
      this.setState({
        boosts,
        token,
        loading: false,
      });
    }
    this.fetchBoosts(token);
  }

  getBoostIcon(boostDetails) {
    if (boostDetails.boostStatus === 'REDEEMED') {
      return require('../../../../assets/completed.png');
    } else if (boostDetails.boostType === 'GAME') {
      return require('../../../../assets/boost_challenge.png');
    }
    return require('../../../../assets/surprise_reward.png');
  }

  getBoostResultIcon(boostStatus, endTime) {
    if (boostStatus === 'REDEEMED') {
      return require('../../../../assets/thumbs_up.png');
    } else if (this.isBoostExpired({ boostStatus, endTime })) {
      return require('../../../../assets/sad_face.png');
    }
  }

  getBoostButton(boostDetails) {
    if (
      boostDetails.boostStatus === 'REDEEMED' ||
      this.isBoostExpired({
        boostStatus: boostDetails.boostStatus,
        endTime: boostDetails.endTime,
      })
    ) {
      return null;
    }

    const conditions = boostDetails.statusConditions.REDEEMED;
    let buttonType = '';
    if (conditions && conditions.length > 0) {
      const condition = conditions[0];
      if (condition.includes('save_event')) buttonType = 'save_event';
      if (condition.includes('social_event')) buttonType = 'social_event';
    }

    if (buttonType === '') {
      return null;
    } else {
      let title = '';
      let action = null;
      if (buttonType === 'save_event') {
        title = 'ADD CASH';
        action = this.onPressAddCash;
      } else if (buttonType === 'social_event') {
        title = 'INVITE FRIENDS';
        action = this.onPressInviteFriends;
      }
      return (
        <Button
          title={title}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={action}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
      );
    }
  }

  getAdditionalLabelRow(boostDetails) {
    if (boostDetails.boostStatus === 'REDEEMED') {
      return <Text style={styles.boostClaimed}>Boost Claimed: </Text>;
    }
    if (
      this.isBoostExpired({
        boostStatus: boostDetails.boostStatus,
        endTime: boostDetails.endTime,
      })
    ) {
      return <Text style={styles.boostExpired}>Boost Expired.</Text>;
    }
    if (this.isBoostExpiringSoon(boostDetails.endTime)) {
      return <Text style={styles.boostExpiring}>Expiring soon</Text>;
    }
  }

  getHighlightBorder(boostDetails) {
    if (
      boostDetails.boostStatus !== 'REDEEMED' &&
      !this.isBoostExpired(boostDetails) &&
      this.isBoostExpiringSoon(boostDetails.endTime)
    ) {
      return styles.purpleBorder;
    }
    return null;
  }

  getCardOpacity(boostStatus, endTime) {
    if (this.isBoostExpired({ boostStatus, endTime })) return 0.6;
    return 1;
  }

  sortBoosts = boosts => {
    const sortByTime = (a, b) =>
      moment(a.endTime).isAfter(moment(b.endTime)) && 1;
    const isOneOf = options => x => options.indexOf(x.boostStatus) !== -1;

    const topGroup = boosts
      .filter(
        isOneOf([BoostStatus.OFFERED, BoostStatus.CREATED, BoostStatus.PENDING])
      )
      .sort(sortByTime);
    const middleGroup = boosts
      .filter(isOneOf([BoostStatus.CLAIMED, BoostStatus.REDEEMED]))
      .sort(sortByTime);
    const bottomGroup = boosts
      .filter(isOneOf([BoostStatus.EXPIRED, BoostStatus.REVOKED]))
      .sort(sortByTime);

    return [...topGroup, ...middleGroup, ...bottomGroup];
  };

  showModalHandler = () => {
    this.setState({ showModal: true });
  };

  hideModalHandler = () => {
    this.setState({ showModal: false });
  };

  fetchBoosts = async token => {
    try {
      const result = await fetch(`${Endpoints.CORE}boost/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      });
      if (result.ok) {
        const resultJson = await result.json();
        const boosts = this.sortBoosts(resultJson);
        console.log('TCL: Boosts -> boosts', boosts);
        this.setState({
          boosts,
          loading: false,
        });
        AsyncStorage.setItem('userBoosts', JSON.stringify(boosts));
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  onPressAddCash = () => {
    this.props.navigation.navigate('AddCash');
  };

  onPressInviteFriends = () => {
    this.props.navigation.navigate('Friends');
  };

  isBoostExpiringSoon(endTime) {
    return moment(endTime).isBefore(moment().add(1, 'days'));
  }

  isBoostExpired({ boostStatus, endTime }) {
    // the server sometimes will not have set a boost status to expire even when its end time is past
    // in that case, as a fallback, we should set the status to expired here
    if (boostStatus === 'EXPIRED') {
      return true;
    }

    return moment(endTime).isBefore(moment());
  }

  renderBoosts() {
    return (
      <View style={styles.cardsWrapper}>
        {this.state.boosts.map((item, index) =>
          this.renderBoostCard(item, index)
        )}
      </View>
    );
  }

  renderBoostCard(boostDetails, index) {
    const permittedTypesOfBoost = getPermittedTypesOfBoost(boostDetails);
    if (permittedTypesOfBoost) {
      const offeredInstructionStatus = boostDetails.messageInstructionIds.instructions.find(
        item => item.status === BoostStatus.OFFERED
      );
      const { msgInstructionId } = offeredInstructionStatus;

      if (msgInstructionId) {
        MessagingUtil.fetchInstructionsMessage(
          this.state.token,
          msgInstructionId
        );
      }
    }

    return (
      <TouchableOpacity
        style={{ width: '100%' }}
        disabled={boostDetails.boostStatus !== BoostStatus.OFFERED}
        onPress={this.showModalHandler}
      >
        <View
          opacity={this.getCardOpacity(
            boostDetails.boostStatus,
            boostDetails.endTime
          )}
          style={[
            styles.boostCard,
            styles.boxShadow,
            this.getHighlightBorder(boostDetails),
          ]}
          key={index}
        >
          <View style={styles.boostTopRow}>
            <Text style={styles.boostTitle}>{boostDetails.label}</Text>
            <View style={styles.boostIconWrapper}>
              {boostDetails.boostType !== 'SIMPLE' ||
              boostDetails.boostStatus === 'REDEEMED' ? (
                <Image
                  source={this.getBoostIcon(boostDetails)}
                  style={styles.boostIcon}
                />
              ) : (
                <Text style={styles.boostAmount}>
                  R{boostDetails.boostAmount}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.boostBottomRow}>
            <View style={styles.boostBottomRowLeft}>
              {boostDetails.boostStatus === 'REDEEMED' ||
              this.isBoostExpired({
                boostStatus: boostDetails.boostStatus,
                endTime: boostDetails.endTime,
              }) ? (
                <Image
                  source={this.getBoostResultIcon(
                    boostDetails.boostStatus,
                    boostDetails.endTime
                  )}
                  style={styles.boostResultIcon}
                />
              ) : null}
              <View style={styles.boostResultTexts}>
                {this.getAdditionalLabelRow(boostDetails)}
                <Text style={styles.boostValidityText}>
                  {boostDetails.boostStatus === 'OFFERED' ||
                  boostDetails.boostStatus === 'PENDING'
                    ? 'Valid until '
                    : ''}
                  {moment(boostDetails.endTime).format('DD MMM YY')}
                </Text>
              </View>
            </View>
            {this.getBoostButton(boostDetails)}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderMainContent() {
    return (
      <View style={styles.contentWrapper}>
        {this.state.boosts && this.state.boosts.length > 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.mainContent}
          >
            {this.renderBoosts()}
            <View style={styles.bottomMargin} />
          </ScrollView>
        ) : (
          <View style={styles.contentWrapper}>
            <Image
              style={styles.image}
              source={require('../../../../assets/group_7.png')}
              resizeMode="contain"
            />
            <Text style={styles.title}>Watch this space…</Text>
            <Text style={styles.description}>
              We’re adding boosts to encourage and celebrate you being a{'\n'}
              happy saver!
            </Text>
          </View>
        )}
      </View>
    );
  }

  render() {
    const { showModal } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Boosts</Text>
        </View>
        {this.state.loading ? (
          <View style={styles.contentWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
          </View>
        ) : (
          this.renderMainContent()
        )}
        <NavigationBar navigation={this.props.navigation} currentTab={2} />
        {showModal && (
          <BoostInstructionModal
            showModal
            navigation={this.props.navigation}
            hideModal={() => this.hideModalHandler()}
            // boostMessage={this.state.boostMessage}
          />
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
  image: {
    marginBottom: 35,
  },
  title: {
    fontFamily: 'poppins-regular',
    fontSize: 6.4 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 4.2 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
  },
  header: {
    width: '100%',
    height: 50,
    marginVertical: 10,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  headerTitle: {
    marginLeft: -5,
    fontFamily: 'poppins-semibold',
    fontSize: 22,
  },
  scrollView: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    width: '100%',
    marginBottom:
      -Sizes.NAVIGATION_BAR_HEIGHT + Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT,
  },
  bottomMargin: {
    marginBottom:
      Sizes.NAVIGATION_BAR_HEIGHT - Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT,
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.6 * FONT_UNIT,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minWidth: '30%',
  },
  buttonContainerStyle: {
    justifyContent: 'center',
    width: '40%',
  },
  cardsWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  boostCard: {
    backgroundColor: Colors.WHITE,
    marginVertical: 12,
    width: '97%',
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: 'center',
  },
  boxShadow: {
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
  },
  boostTopRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boostTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    maxWidth: '80%',
    marginBottom: 5,
    color: Colors.DARK_GRAY,
  },
  boostIconWrapper: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: Colors.SKY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostIcon: {},
  boostAmount: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.PURPLE,
  },
  boostBottomRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  boostBottomRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boostResultIcon: {
    marginRight: 15,
  },
  boostResultTexts: {
    justifyContent: 'center',
  },
  boostValidityText: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: Colors.MEDIUM_GRAY,
  },
  boostClaimed: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.GREEN,
  },
  boostExpired: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.RED,
  },
  boostExpiring: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.LIGHT_RED,
  },
  purpleBorder: {
    borderWidth: 1,
    borderColor: Colors.PURPLE,
  },
});

export default Boosts;
