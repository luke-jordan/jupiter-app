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
import { Button } from 'react-native-elements';

import BoostOfferModal from '../elements/boost/BoostOfferModal';

import NavigationBar from '../elements/NavigationBar';
import { BoostStatus } from '../modules/boost/models';
import { LoggingUtil } from '../util/LoggingUtil';
import { Sizes, Endpoints, Colors } from '../util/Values';
import { equalizeAmounts } from '../modules/boost/helpers/parseAmountValue';

import { extractConditionParameter, getDivisor } from '../util/AmountUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
});

class Boosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_BOOST_LIST');

    let boosts = await AsyncStorage.getItem('userBoosts');
    if (boosts) {
      boosts = JSON.parse(boosts);
      this.setState({
        boosts,
        loading: false,
      });
    }
    this.fetchBoosts();
  }

  getBoostIcon(boostDetails) {
    if (boostDetails.boostStatus === 'REDEEMED') {
      return require('../../assets/completed.png');
    } else if (boostDetails.boostType === 'GAME') {
      return require('../../assets/boost_challenge.png');
    }
    return require('../../assets/surprise_reward.png');
  }

  getBoostResultIcon(boostStatus, endTime) {
    if (boostStatus === 'REDEEMED') {
      return require('../../assets/thumbs_up.png');
    } else if (this.isBoostExpired({ boostStatus, endTime })) {
      return require('../../assets/sad_face.png');
    }
  }

  // note : 'pending' state means no further action from user, so here is the same as redeemed (thus also skipped over)
  getNextStatus(boostStatus, statusConditionKeys) {
    if ([BoostStatus.PENDING, BoostStatus.REDEEMED, BoostStatus.EXPIRED, BoostStatus.REVOKED].includes(boostStatus)) {
      return null;
    }

    const isBoostPreAction = [BoostStatus.CREATED, BoostStatus.OFFERED].includes(boostStatus);
    if (isBoostPreAction) {
      return statusConditionKeys.includes(BoostStatus.UNLOCKED) ? BoostStatus.UNLOCKED : BoostStatus.REDEEMED;
    }

    if (boostStatus === BoostStatus.UNLOCKED) {
      return BoostStatus.REDEEMED;
    }
  }

  getNextStatusAndThresholdEvent(boostStatus, statusConditions) {
    const nextStatus = this.getNextStatus(boostStatus, Object.keys(statusConditions));
    // console.log('BOOST NEXT STATUS: ', nextStatus);
    if (!nextStatus) {
      return { nextStatus: null };
    }

    const conditions = statusConditions[nextStatus];
    // console.log('EXTRACTED BOOST CONDITION: ', conditions);

    let thresholdEventType = '';
    if (conditions && conditions.length > 0) {
      const condition = conditions[0];
      if (condition.includes('save_event')) thresholdEventType = 'save_event';
      if (condition.includes('first_save_above')) thresholdEventType = 'onboard_save_event';
      if (condition.includes('friends_added_since')) thresholdEventType = 'social_event';
      if (condition.includes('total_number_friends')) thresholdEventType = 'social_event';
      if (condition.includes('number_taps')) thresholdEventType = 'game_event';
      if (condition.includes('percent_destroyed')) thresholdEventType = 'game_event';
    }
    
    return { nextStatus, thresholdEventType };
  }

  getBoostButton(boostDetails) {
    const isBoostExpired = this.isBoostExpired({ boostStatus: boostDetails.boostStatus, endTime: boostDetails.endTime });
    if (boostDetails.boostStatus === 'REDEEMED' || isBoostExpired) {
      return null;
    }

    const { nextStatus, thresholdEventType } = this.getNextStatusAndThresholdEvent(boostDetails.boostStatus, boostDetails.statusConditions);
    // console.log('Next status: ', nextStatus, 'threshold event: ', thresholdEventType);
    if (!nextStatus) {
      return null;
    }

    if (thresholdEventType === '') {
      return null;
    } else {
      let title = '';
      let action = null;
      if (thresholdEventType === 'save_event') {
        title = 'SAVE NOW';
        const amount = this.extractStatusThreshold(boostDetails.statusConditions, nextStatus);
        action = () => this.onPressAddCash(amount);
      } else if (thresholdEventType === 'onboard_save_event') {
        title = 'SAVE NOW';
        action = this.onPressFirstAddCash;
      } else if (thresholdEventType === 'social_event') {
        title = 'ADD BUDDIES';
        action = this.onPressInviteFriends;
      } else if (thresholdEventType === 'game_event') {
        title = 'PLAY GAME';
        console.log('Boost details: ', boostDetails);
        action = () => this.props.navigation.navigate('Home', { showGameUnlockedModal: true, boostDetails });
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
    if (boostDetails.boostStatus === 'PENDING') {
      const endTime = moment(boostDetails.endTime);
      return <Text style={styles.boostExpiring}>Waiting for results (check back in {endTime.fromNow(true)})</Text>;
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
    if ([BoostStatus.UNLOCKED, BoostStatus.PENDING].indexOf(boostDetails.boostStatus) > 0 && !this.isBoostExpired(boostDetails)) {
      return styles.purpleBorder;
    }
    return null;
  }

  getCardOpacity(boostStatus, endTime) {
    if (boostStatus === 'REDEEMED' || this.isBoostExpired({ boostStatus, endTime })) return 0.6;
    return 1;
  }

  sortBoosts = boosts => {
    const sortByTime = (a, b) =>
      moment(b.startTime).isAfter(moment(a.startTime)) && 1;

    return boosts.sort(sortByTime);

    // keeping this here, in case

    // const isOneOf = options => x => options.indexOf(x.boostStatus) !== -1;
    // const topGroup = boosts
    //   .filter(
    //     isOneOf([BoostStatus.OFFERED, BoostStatus.CREATED, BoostStatus.UNLOCKED, BoostStatus.PENDING])
    //   )
    //   .sort(sortByTime);
    // const middleGroup = boosts
    //   .filter(isOneOf([BoostStatus.CLAIMED, BoostStatus.REDEEMED]))
    //   .sort(sortByTime);
    // const bottomGroup = boosts
    //   .filter(isOneOf([BoostStatus.EXPIRED, BoostStatus.REVOKED]))
    //   .sort(sortByTime);

    // return [...topGroup, ...middleGroup, ...bottomGroup];
  };

  extractStatusThreshold = (statusConditions, boostStatus = BoostStatus.REDEEMED) => {
    const redeemConditions = statusConditions[boostStatus];
    if (!redeemConditions) {
      return null;
    }
    const saveCondition = redeemConditions.find((condition) => condition.startsWith('save_event_greater_than'));
    if (!saveCondition) {
      return null;
    }
    const saveConditionParam = extractConditionParameter(saveCondition);
    if (!saveConditionParam) {
      return null;
    }

    const thresholdNumber = equalizeAmounts(saveConditionParam) / getDivisor('DEFAULT');
    return thresholdNumber;
  }

  showModalHandler = (boostModalParams) => {
    this.setState({ showModal: true, currentBoostParameters: boostModalParams });
  };

  hideModalHandler = () => {
    this.setState({ showModal: false });
  };

  handleTappedBoost = (boostDetails) => {
    const { nextStatus, thresholdEventType } = this.getNextStatusAndThresholdEvent(boostDetails.boostStatus, boostDetails.statusConditions);
    if (thresholdEventType === 'save_event') {
      const boostThreshold = this.extractStatusThreshold(boostDetails.statusConditions, nextStatus);
      const boostModalParams = { ...boostDetails, boostThreshold };
      this.showModalHandler(boostModalParams);
      return;
    }

    if (thresholdEventType === 'game_event') {
      this.props.navigation.navigate('Home', { showGameUnlockedModal: true, boostDetails });
    }

    return false;
  }

  fetchBoosts = async () => {
    try {
      const result = await fetch(`${Endpoints.CORE}boost/list`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'GET',
      });
      if (result.ok) {
        const resultJson = await result.json();
        const boosts = this.sortBoosts(resultJson);
        // console.log('TCL: Boosts -> boosts', boosts);
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

  onPressAddCash = amount => this.props.navigation.navigate('AddCash', { preFilledAmount: amount, startNewTransaction: true });

  onPressFirstAddCash = () => {
    this.props.navigation.navigate('OnboardAddSaving', { startNewTransaction: true });
  }

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

  renderBoostCard(boostDetails) {
    
    // will come back to this, for now is causing nasty bugs
    // const permittedTypesOfBoost = getPermittedTypesOfBoost(boostDetails);
    // if (permittedTypesOfBoost && boostDetails.messageInstructionIds && boostDetails.messageInstructionIds.instructions) {
    //   const offeredInstructionStatus = boostDetails.messageInstructionIds.instructions.find(
    //     item => item.status === BoostStatus.OFFERED
    //   );
    //   const { msgInstructionId } = offeredInstructionStatus;

    //   if (msgInstructionId) {
    //     MessagingUtil.fetchInstructionsMessage(
    //       this.props.authToken,
    //       msgInstructionId
    //     );
    //   }
    // }

    return (
      <TouchableOpacity
        disabled={boostDetails.boostStatus !== BoostStatus.OFFERED && boostDetails.boostStatus !== BoostStatus.UNLOCKED}
        onPress={() => this.handleTappedBoost(boostDetails)}
        key={boostDetails.boostId}
        style={[
          styles.boostCard,
          styles.boxShadow,
          this.getHighlightBorder(boostDetails),
        ]}
      >
        <View
          opacity={this.getCardOpacity(
            boostDetails.boostStatus,
            boostDetails.endTime
          )}
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
              source={require('../../assets/group_7.png')}
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
          <BoostOfferModal
            showModal
            navigation={this.props.navigation}
            hideModal={() => this.hideModalHandler()}
            boostDetails={this.state.currentBoostParameters}
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

export default connect(mapStateToProps)(Boosts);
