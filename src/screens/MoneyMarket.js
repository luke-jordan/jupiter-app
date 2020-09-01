import React from 'react';

import { Text, TouchableOpacity, ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Icon } from 'react-native-elements';

import ConfettiCannon from 'react-native-confetti-cannon';

import { LoggingUtil } from '../util/LoggingUtil';

import { Colors } from '../util/Values';

export default class Stokvel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  };

  async componentDidMount() {
    LoggingUtil.logEvent('USER_OPENED_MONEY_MARKET');
  };

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressArticleLink = () => {
    Linking.openURL('https://jupitersave.com/blog/so-how-does-jupiter-pay-us-6');
  }

  render() {
    return (
      <View style={styles.container}>
        <ConfettiCannon 
          count={200} 
          origin={{x: -10, y: 0}} 
          colors={[Colors.GOLD, Colors.PURPLE, Colors.SKY_BLUE]} 
          fadeOut 
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.onPressBack}
          >
            <Icon
              name="chevron-left"
              type="evilicon"
              size={45}
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Money Market Funds
          </Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.mainContent}
        >
          <Text style={styles.bodyText}>
            <Text style={styles.bodyEmphasis}>
              Last updated: June 2020{'\n'}
            </Text>
            A longer version of this article is available on <Text onPress={this.onPressArticleLink} style={styles.bodyLink}>our website</Text>

            {'\n'}{'\n'}<Text style={styles.bodySectionTitle}>SO HOW DOES JUPITER PAY US 4.5%?{'\n'}</Text>
            By investing all your contributions in something called a Money Market Fund. 
            What exactly is a money market fund, and why is it a great place for my savings?:
            {'\n'}{'\n'}
            To answer this, there&apos;s a few things we want to share with you: {'\n'}
            {'\u2022'}{'\u0009'}Banks are a type of business, they borrow money from us to lend out as loans.{'\n'}
            {'\u2022'}{'\u0009'}Their cost for this money is the interest paid on our deposits. Like any business, banks want to keep its costs low.{'\n'}
            {'\n'}
            This is why a bank prefers to &quot;borrow&quot; our cheque account deposits-because in most banks, 
            individuals (and even savings clubs!) get paid zero interest on this money (i.e. it&apos;s &quot;free&quot; money to the bank).

            {'\n'}{'\n'}
            The next cheapest option are our savings, notice and fixed deposits. These usually pay us decent interest rates, but are 
            generally lower than a bank would pay a large company to borrow their deposits.
            {'\n'}{'\n'}
            Why is it lower? Because large companies have large deposits, and they have the ability to bargain for a higher interest 
            rate than you and I receive.

            {'\n'}{'\n'}
            So which companies have the largest deposits? South Africa&apos;s &quot;money managers&quot; i.e. the pension funds 
            and asset managers - so they negotiate the hardest for the best rates.
            
            {'\n'}{'\n'}
            In addition to lending to banks, asset managers lend money to large corporates and government entities as well - all 
            for a negotiated interest rate of course.{'\n'}
            {'\n'}
            When we started Jupiter, we knew that we wanted to give our clients a higher interest rate than most of us could negotiate 
            by ourselves. We also knew we didn&apos;t (yet) have the bargaining power to negotiate this high interest rate as Jupiter.
            
            {'\n'}{'\n'} 
            So we negotiated instead with one of the largest asset managers in South Africa - Allan Gray, to use their money market fund. 
            And in this way, Jupiter uses THEIR bargaining power to benefit all of us with our savings!{'\n'} 
            {'\n'}
            Typically, Allan Gray would require a minimum R500 per save (or R20 000 lump sum) for you to use their funds.
            
            {'\n'}{'\n'}
            That&apos;s rough - so we&apos;ve developed the Jupiter app to get you access for any savings amount to the fund 
            via the Jupiter Stokvel, even if you wanted to save just R5 at a time!

            {'\n'}{'\n'}Want to know more about money market funds? Read our article on our website here: 
            <Text onPress={this.onPressArticleLink} style={styles.bodyLink}>https://jupitersave.com/blog/so-how-does-jupiter-pay-us-6</Text>
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  header: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerTitle: {
    marginLeft: -5,
    fontFamily: 'poppins-semibold',
    fontSize: 16,
  },
  scrollView: {
    marginTop: 20,
    marginBottom: 20,
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  bodyText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    textAlign: 'justify',
  },
  bodySectionTitle: {
    fontFamily: 'poppins-semibold',
  },
  bodyEmphasis: {
    fontFamily: 'poppins-semibold',
  },
  bodyLink: {
    textDecorationLine: 'underline',
    color: Colors.PURPLE,
  },
});
