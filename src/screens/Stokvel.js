import React from 'react';

import { Text, TouchableOpacity, ScrollView, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';

import { Colors } from '../util/Values';

export default class Stokvel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  };

  async componentDidMount() {
    LoggingUtil.logEvent('USER_OPENED_STOKVEL');
  };

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  render() {
    return (
      <View style={styles.container}>
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
            Constitution of the Jupiter Stokvel
          </Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.mainContent}
        >
          <Text style={styles.bodyText}>
            <Text style={styles.bodyEmphasis}>
              Last updated: February 2020{'\n'}
            </Text>
            The name of the stokvel is the Jupiter Stokvel.{'\n'}

            {'\n'}<Text style={styles.bodySectionTitle}>AIMS AND OBJECTIVES OF THE JUPITER STOKVEL:{'\n'}</Text>
            The Jupiter Stokvel is a savings and investment stokvel group formed by a collective of individual members who share a common interest of building savings and investments towards financial security of its members. {'\n'}
            The Jupiter Stokvel seeks to:{'\n'}
            {'\u2022'}{'\u0009'}Provide an organised structure for the purposes of increasing savings through contributions by members. {'\n'}
            {'\u2022'}{'\u0009'}Ensure that each member’s contributions remain their own, and no utilising of one member’s contribution to lend to another members is allowed or possible within the Jupiter Stokvel structure.{'\n'}
            {'\u2022'}{'\u0009'}Establish measures and encouragement which promote the financial development of the individual members and the group.{'\n'}
            {'\u2022'}{'\u0009'}Establish mechanisms which protect the interests of all members.{'\n'}
            <Text style={styles.bodySectionTitle}>THIS CONSTITUTION OUTLINES THE RULES OF THE JUPITER STOKVEL.</Text>{'\n'}
            All members of the Jupiter Stokvel will be required to abide by the rules as outlined in this constitution.{'\n'}
            Any activities undertaken by the Jupiter Stokvel must comply with the constitution adopted by its members.{'\n'}
            The Jupiter Stokvel exists and operates as a separate legal entity (separate from its membership) and changes in the membership.{'\n'}
            <Text style={styles.bodySectionTitle}>1. JUPITER STOKVEL MEMBERSHIP{'\n'}</Text>
            A. The number of members in the Jupiter Stokvel is not limited.{'\n'}
            B. Membership to the Jupiter Stokvel is at the Jupiter Stokvel’s discretion.{'\n'}
            C. The Jupiter Stokvel is allowed to decline admission of a prospective member without providing any reasons.{'\n'}
            D. Upon request, all members will provide their relevant personal details (certified copy of ID and proof of residential address).{'\n'}
            E. Should a member pass away, his or her family members will not automatically become members of the Stokvel (See point 8B below for further information in this matter).{'\n'}
            F. No under 18 years of age members are allowed. If someone under the age of 18 wishes to participate, their parents/ guardian needs to do so on their behalf unless a resolution is passed in a meeting with the executive committee.{'\n'}
            <Text style={styles.bodySectionTitle}>2. JUPITER STOKVEL EXECUTIVE</Text>{'\n'}
            A. The Jupiter Stokvel will appoint an executive committee which will include a Chairperson, Secretary and Treasurer. {'\n'}
              A member can hold a maximum of two roles in the executive committee.{'\n'}
              Members of the executive committee will be required to carry out their duties as stated on the constitution of the Jupiter Stokvel.{'\n'}
              Should an executive committee member be no longer be able to carry out his/her duties, a replacement member can be appointed at the next general meeting.{'\n'}
            <Text style={styles.bodySectionTitle}>3. EXECUTIVE ROLES &amp; RESPONSIBILITIES</Text>{'\n'}
            Chairperson:	{'\n'}
            {'\u2022'}{'\u0009'}Lead all Jupiter Stokvel activities and ensure that the requirements of the constitution are followed.{'\n'}
            {'\u2022'}{'\u0009'}In partnership with the Jupiter Stokvel Secretary, prepare Jupiter Stokvel meetings.{'\n'}
            {'\u2022'}{'\u0009'}Chair all Jupiter Stokvel meetings.{'\n'}
            {'\u2022'}{'\u0009'}Establish relationships and identify opportunities for growth and development.{'\n'}
            Secretary: {'\n'}
            {'\u2022'}{'\u0009'}Update and maintain accurate records of all the Jupiter Stokvel’s membership registers, meeting minutes and communications.{'\n'}
            {'\u2022'}{'\u0009'}Communicate the Jupiter Stokvel activities with all members.{'\n'}
            Treasurer: {'\n'}
            {'\u2022'}{'\u0009'}Update and maintain accurate records of all the Jupiter Stokvel’s financial records.{'\n'}
            {'\u2022'}{'\t'}Present at minimum, an annual financial report which includes:{'\n'}
            {'\u2022'}{'\t'}The total current value of the Jupiter Stokvel’s investments.{'\n'}
            {'\u2022'}{'\t'}The total value of the Jupiter Stokvel’s assets.{'\n'}
            {'\u2022'}{'\t'}An update of all members’ monthly contributions.{'\n'}
            <Text style={styles.bodySectionTitle}>4. JUPITER STOKVEL MEETINGS</Text>{'\n'}
            A. There will not be monthly meetings for the Jupiter Stokvel.{'\n'}
            B. When necessary, the executive committee will convene an annual general meeting where matters which require voting by members will be discussed.{'\n'}
            C. Members of the Jupiter Stokvel will elect an appropriate day and time to hold Jupiter Stokvel meetings. {'\n'}
            D. Unless invited by the executive committee, non-members will not be allowed to sit in on the AGM.{'\n'}
            E. Special or emergency meetings may be scheduled by the executive committee as and when necessary.{'\n'}
            <Text style={styles.bodySectionTitle}>5.INSTRUCTIONS AND AUTHORISATION THROUGH THE JUPITER APP</Text>{'\n'}
            A. Funds are to be transferred into the Jupiter Clients bank account (FNB bank account: 62828393728) - a bank account which is 
            specific to the receiving of Jupiter Stokvel member contributions.{'\n'}
            B. The executive committee of the Jupiter Stokvel has granted approval Jupiter Savings Pty Ltd to utilise the Jupiter Savings 
            Pty Ltd &quot;Jupiter Clients bank account&quot; solely for the purpose of receiving Jupiter Stokvel members contribution.{'\n'}
            C. The management of Jupiter Savings Pty Ltd have agreed that the maximum amount of time which Jupiter Stokvel funds will 
            remain in the Jupiter Clients bank account is 24 hours, and any interest earned by Jupiter Savings Pty Ltd will be passed
            on to the Jupiter Stokvel members in proportion to their contributions in the period in which interest was earned.{'\n'}
            D. The Jupiter Stokvel executive committee has appointed and authorised Jupiter Savings Pty Ltd to be the intermediary app platform upon which all members transact, action and process instructions for the investment of members funds.{'\n'}
            E. Jupiter Stokvel members will directly utilise the Jupiter Savings app platform to place any instruction with regards to their funds (deposit, transact and withdraw){'\n'}
            F. Jupiter Stokvel members will have access to all “boosts” and other such benefits of the Jupiter App platform.{'\n'}
            F. Only instructions, interactions and authorisation through the Jupiter app platform will be actioned and processed.{'\n'}
            G. The executive committee of the Jupiter Stokvel has granted Jupiter Savings Pty Ltd a non-discretionary mandate in terms of investment of Jupiter Stokvel member funds.{'\n'}
              In this regard, Jupiter Saving Pty Ltd will have a mandate to invest all member funds solely in the Allan Gray Money Market Fund.{'\n'}
              Jupiter Savings Pty Ltd’s role is merely as the administrator - and the ultimate decision as to the placement or investment of member funds will remain under the member’s discretion via instruction on the Jupiter App. {'\n'}
            H. In the event of Jupiter Savings Pty Ltd changing the financial service provider of the money market fund:{'\n'}
            {'\u2022'}{'\u0009'}Jupiter Savings Pty Ltd commits to only take this action if this is beneficial to the Jupiter Stokvel members.{'\n'}
            {'\u2022'}{'\u0009'}Jupiter Savings Pty Ltd commits that the service provider of these money market funds will be a tier 1 service provider in the South African financial sector.{'\n'}
            {'\u2022'}{'\u0009'}Jupiter Savings Pty Ltd commits to informing the Jupiter Stokvel executive committee within 3 business days of making the change to a new financial service provider’s money market fund. {'\n'}
            {'\u2022'}{'\u0009'}The Jupiter Stokvel executive committee agree that new contributions from members can be invested in the new financial service provider’s money market fund as soon as the account is open, and prior to Jupiter Savings Pty Ltd notice to the executive committee. {'\n'}
            {'\u2022'}{'\u0009'}In the event of a change in financial service provider of the money market fund, the contributions and proceeds invested in the Allan Gray Money Market Fund up to that date, can remain in this fund, unless deemed to not be in the interest of Jupiter Stokvel members by Jupiter Savings Pty Ltd. {'\n'}
            I. If the Jupiter Stokvel executive committee changes the mandate to Jupiter Savings Pty Ltd to invest in multiple funds, this can only be done under the following circumstances:{'\n'}
            {'\u2022'}{'\u0009'}This change in mandate will only occur after the Jupiter Stokvel executive committee has met and a vote to allow such a decision has taken place.{'\n'}
            {'\u2022'}{'\u0009'}Jupiter Savings Pty Ltd will be fulfilling the decisions of the Jupiter Stokvel member/s, and fund selection will be at the discretion of the Jupiter Stokvel members, not at the discretion of Jupiter Savings Pty Ltd.{'\n'}
            J. The Jupiter Stokvel executive committee acknowledges and accepts that the Jupiter Savings Pty Ltd entity does not provide financial advice with regards to products or services it currently, or in future will offer.{'\n'}
            <Text style={styles.bodySectionTitle}>6.JOINING FEE AND FURTHER CONTRIBUTIONS</Text>{'\n'}
            A. There is no joining fee to join the Jupiter Stokvel{'\n'}
            B. Each member of the Jupiter Stokvel is allowed to make contributions as and when they are able or willing to contribute.{'\n'}
            C. There is no expectation that the member should make regular contributions, nor contribute the same amount of funds on each transaction.{'\n'}
            <Text style={styles.bodySectionTitle}>7. ENTITLEMENT TO CONTRIBUTIONS AND FURTHER BENEFITS ON FUNDS</Text>{'\n'}
            A. These are the contributions made by the members during their membership of the Jupiter Stokvel, and the proceeds received from the investments on the Jupiter Savings App.{'\n'}
            B. Members have access to their contributions and benefits of funds with no “lock in” period.{'\n'}
            <Text style={styles.bodySectionTitle}>8. EXIT OR TERMINATION OF MEMBERSHIP</Text>{'\n'}
            A. Should a member terminate membership with the Jupiter Stokvel, the full value of their Jupiter Stokvel holdings, minus any deductible expenses, will be deposited into the bank account in the member’s name within 5 days of termination.{'\n'}
            B. Should a member of the Jupiter Stokvel die, the full value of their Jupiter Stokvel holdings will be paid into their estate within 90 days. The laws that govern how a deceased estate is wound up will govern this process.{'\n'}
            <Text style={styles.bodySectionTitle}>9. JUPITER STOKVEL TERMINATION</Text>{'\n'}
            A. Should the Jupiter Stokvel be terminated for whatever reason, any excess funds and assets of the Jupiter Stokvel will be shared amongst the members in proportion to their contributions.{'\n'}
            B. Any liabilities incurred by the Jupiter Stokvel will be shared equally upon termination of the Jupiter Stokvel.{'\n'}
            <Text style={styles.bodySectionTitle}>10. CODE OF CONDUCT</Text>{'\n'}
            A. No member will use the name of the Stokvel for personal business purposes or personal gain.{'\n'}
            By continued contribution to the Jupiter Stokvel, you accept this constitution.{'\n'}

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
});
