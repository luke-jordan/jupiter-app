import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { Icon } from 'react-native-elements';
import { Colors } from '../util/Values';

const COLOR_WHITE = '#fff';

export default class PrivacyPolicy extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_OPENED_PRIVACY_POLICY');
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressPrivacy = () => {

  }

  onPressCompanyInformation = () => {

  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={this.onPressBack} >
            <Icon
              name='chevron-left'
              type='evilicon'
              size={45}
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.mainContent}>
          <Text style={styles.termsText}>
            <Text style={styles.termsSectionTitle}>
              1. Acceptance of terms{"\n"}
            </Text>
            Thank you for choosing Luno. The following Terms and Conditions and the
            <Text style={styles.termsLink} onPress={this.onPressPrivacy}>
            {" "}Privacy policy{" "}
            </Text>
            (together, the “Terms”) apply to any person that registers for and/or opens a Luno Account through Luno.com or any associated mobile applications, website, or APIs (together, the “Luno Site”).{"\n"}
            {"\n"}
            The Terms constitute a legally binding agreement between you and Luno Pte. Ltd., which is a company incorporated under the laws of Singapore. For further information on Luno Pte. Ltd., and its operating subsidiaries, please see the
            <Text style={styles.termsLink} onPress={this.onPressCompanyInformation}>
            {" "}Company Information{" "}
            </Text>
            page on the Luno website. For the purposes of these Terms, any reference to “we” “us” “our” “Luno” and/or any similar term shall be construed as reference to Luno Pte. Ltd.{"\n"}
            {"\n"}
            By registering for and opening a Luno Account, you unconditionally accept these Terms and agree to be bound by and act in accordance with them. You also accept and agree that you are solely responsible for understanding and complying with all laws, rules, regulations and requirements of the jurisdiction in which you live that may be applicable to your use of the Luno Site and/or your Luno Account, including but not limited to, those related to export or import activity, taxes or foreign currency transactions.
            {"\n"}{"\n"}
            Please read these Terms carefully before using the Luno Site because they affect your legal rights and obligations.{"\n"}
            {"\n"}
            <Text style={styles.termsSectionTitle}>
              2. Ammendment of terms{"\n"}
            </Text>
            We care about your privacy. As a responsible{"\n"}
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
    backgroundColor: COLOR_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerTitle: {
    marginLeft: -5,
    fontFamily: 'poppins-semibold',
    fontSize: 22,
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
  termsText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
  },
  termsSectionTitle: {
    fontFamily: 'poppins-semibold',
  },
  termsLink: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
});
