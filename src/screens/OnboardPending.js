import React from 'react';
import { connect } from 'react-redux';

import { View, Image, Text, ScrollView, StyleSheet, AsyncStorage } from 'react-native';
import { Button } from 'react-native-elements';

import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../util/Values';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { updateCurrentTransaction } from '../modules/transaction/transaction.actions';

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
});

const mapDispatchToProps = {
  updateCurrentTransaction,
}

class OnboardPending extends React.Component {

  async componentDidMount() {
    const { params } = this.props.navigation.state;
    if (this.props.navigation.getParam('stepToTake')) {

    }

    const latestProfile = await this.fetchFullProfile();
    
  }

  async fetchFullProfile() {

  }

  renderPersonalDetails = () => (
    <>
      <View style={styles.innerHeaderContainer}>
        <Image 
          style={styles.innerHeaderIcon}
          source={require('../../assets/smile.png')}
          resizeMode="contain"
        />
        <Text style={styles.innerHeaderText}>Check your details</Text>
      </View>
      <Text style={styles.innerDescription}>
        The ID number you provided did not match your name. Please double check the ID number and spelling of your name and retry.  
      </Text>
      <Button 
        title="EDIT MY DETAILS"
        titleStyle={styles.nextStepButtonText}
        buttonStyle={styles.nextStepButton}
        containerStyle={styles.buttonContainer}
      />
    </>
  )

  renderCompleteAgreement = () => (
    <>
      <View style={styles.innerHeaderContainer}>
        <Image
          style={styles.innerHeaderIcon}
          source={require('../../assets/check-circle.png')}
          resizeMode="contain"
        />
        <Text style={styles.innerHeaderText}>Complete Agreement</Text>
      </View>
      <Text style={styles.innerDescription}>
        Read a quick agreement which lets you know how your savings will be invested in the best way possible. 
      </Text>
      <Button 
        title="VIEW AGREEMENT"
        titleStyle={styles.nextStepButtonText}
        buttonStyle={styles.nextStepButton}
        containerStyle={styles.buttonContainer}
      />
    </>
  );

  renderAddFirstSavings = () => (
    <>
      <View style={styles.innerHeaderContainer}>
        <Image
          style={styles.innerHeaderIcon}
          source={require('../../assets/check-circle.png')}
          resizeMode="contain"
        />
        <Text style={styles.innerHeaderText}>Add your first savings</Text>
      </View>
      <Text style={styles.innerDescription}>
        Start your savings account with as much or as little as you like. As soon as we receive your funds you’ll start earning interest!  
      </Text>
      <Button style={styles.nextStepButton}>
        <Text style={styles.nextStepButtonText}>ADD SAVINGS</Text>
      </Button>
    </>
  )

  renderCheckingOzow = () => (
    <>
      <View style={styles.innerHeaderContainer}>
        <Image
          style={styles.innerHeaderIcon}
          source={require('../../assets/check-circle.png')}
          resizeMode="contain"
        />
        <Text style={styles.innerHeaderText}>Checking for payment</Text>
      </View>
      <Text style={styles.innerDescription}>
        Sorry, we seem to be having some trouble finding your payment. Would you prefer to pay via manual EFT instead?
      </Text>
      <Button 
        title="PAY VIA EFT"
        titleStyle={styles.nextStepButtonText}
        buttonStyle={styles.nextStepButton}
        containerStyle={styles.buttonContainer}
      />
      <Button 
        title="TRY AGAIN WITH OZOW"
        titleStyle={styles.nextStepButtonText}
        buttonStyle={styles.nextStepButton}
        containerStyle={styles.buttonContainer}
      />
      <Text>
        Check again
      </Text>

    </>
  );

  renderPendingEFT = () => (
    <>
    </>
  );

  renderFinishSave = () => {
    return this.renderCheckingOzow();
  }

  renderNextStep() {
    let renderFunction = () => (<Text>Loading...</Text>);

    const onboardStepsRemaining = ['FINISH_SAVE'];
    
    if (onboardStepsRemaining.includes('FAILED_VERIFICATION')) {
      renderFunction = this.renderPersonalDetails;
    } else if (onboardStepsRemaining.includes('AGREE_REGULATORY')) {
      renderFunction = this.renderCompleteAgreement;
    } else if (onboardStepsRemaining.includes('ADD_CASH')) {
      renderFunction = this.renderAddFirstSavings;
    } else if (onboardStepsRemaining.includes('FINISH_SAVE')) {
      renderFunction = this.renderFinishSave;
    }

    return (
      <View>
        {renderFunction()}
      </View>
    )
  }

  render() {
    return (
      <LinearGradient
        colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
        start={[0.5, 0]}
        end={[0.5, 1]}
        style={styles.gradientContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.headerText}>
            Hello, <Text style={styles.headerTextName}>Luke</Text>
          </Text>
          <Image
            source={require('../../assets/onboard_rocket.png')}
            style={styles.rocketImage}
            resizeMode="contain"
          />
          <Text style={styles.subText}>
            Get ready to grow your savings and start earning returns
          </Text>
          <Text style={styles.launchAccountText}>
            TO LAUNCH YOUR ACCOUNT:
          </Text>
          <View style={styles.nextStepContainer}>
            {this.renderNextStep()}
          </View>
          <View style={styles.footerContainer}>
            <View style={styles.footerWrapper}>
              <Text style={styles.footerTitle}>
                Were you expecting to see something different?
              </Text>
              <View style={styles.footerInner}>
                <Text style={styles.logoutText}>
                  Logout
                </Text>
                <Text style={{ color: Colors.WHITE }}>|</Text>
                <Text style={styles.supportText}>
                  Contact Support
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

}

const styles = StyleSheet.create({
  gradientContainer: {
    minHeight: '100%',
    minWidth: '100%',
    alignItems: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
    minHeight: '100%',
    minWidth: '100%',
  },
  headerText: {
    fontFamily: 'poppins-regular',
    fontSize: 24,
    textAlign: 'center',
    color: Colors.WHITE,
    width: '100%',
    marginTop: 10,
  },
  headerTextName: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
  },
  rocketImage: {
    marginTop: 16,
    width: 122,
    height: 97,
  },
  subText: {
    marginTop: 20,
    fontFamily: 'poppins-regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: Colors.WHITE,
    paddingHorizontal: 25,
  },
  launchAccountText: {
    marginTop: 20,
    fontFamily: 'poppins-semibold',
    fontSize: 12,
    color: Colors.WHITE,
    width: '100%',
    textAlign: 'left',
    paddingHorizontal: 15,
  },
  nextStepContainer: {
    marginTop: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  // eslint-disable-next-line react-native/no-color-literals
  footerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 20,
  },
  footerTitle: {
    fontFamily: 'poppins-regular',
    fontSize: 12,
    color: Colors.WHITE,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  footerInner: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    textAlign: 'right',
    paddingEnd: 10,
    color: Colors.WHITE,
    fontFamily: 'poppins-semibold',
    fontSize: 12,
  },
  supportText: {
    textAlign: 'left',
    paddingStart: 10,
    color: Colors.WHITE,
    fontFamily: 'poppins-semibold',
    fontSize: 12,
  },
  innerHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  innerHeaderIcon: {
    tintColor: Colors.PURPLE,
    width: 20,
    height: 20,
    marginEnd: 10,
  },
  innerHeaderText: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  innerDescription: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 5,
    color: Colors.MEDIUM_GRAY,
  },
  buttonContainer: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepButton: {
    backgroundColor: Colors.WHITE,
    borderColor: Colors.PURPLE,
    borderWidth: 2,
    borderRadius: 4,
    width: 210,
  },
  nextStepButtonText: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PURPLE,
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(OnboardPending);
