import React from 'react';

import { View, Image, Text, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const steps = [
  'PROFILE',
  'PASSWORD',
  'AGREEMENT',
  'ADD_SAVINGS',
];

const OnboardBreadCrumb = ({
  currentStep,
}) => {

  const isStepPrior = (stepToCheck) => steps.indexOf(stepToCheck) <= steps.indexOf(currentStep);

  const renderThisOrPriorStep = (stepName, stepLabel, stepIconSrc) => (
    <LinearGradient
      colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
      style={styles.gradientContainer}
      start={[0, 0.5]}
      end={[1, 0.5]}
    >
      {currentStep === stepName ? (
        <Image
          style={[styles.stepIcon, styles.thisStepIcon]}
          source={stepIconSrc}
          resizeMode="contain"
        /> 
      ) : (
        <Image
          style={styles.stepIcon}
          source={require('../../assets/onboard-check.png')}
          resizeMode="contain"
        />
      )}
      <Text style={styles.currentStepText}>{stepLabel}</Text>
    </LinearGradient>
  );

  const renderOtherStep = (stepLabel, stepIconSrc) => (
    <>
      <Image
        style={[styles.stepIcon, styles.otherStepIcon]}
        source={stepIconSrc}
        resizeMode="contain"
      />
      <Text style={styles.otherStepText}>{stepLabel}</Text>
    </>
  )

  return (
    <View style={styles.container}>

      {/* PROFILE STEP */}
      <View style={styles.stepContainer}>
        {isStepPrior('PROFILE') && renderThisOrPriorStep('PROFILE', 'Details', require('../../assets/smile.png'))}
      </View>

      {/* PASSWORD STEP */}
      <View style={styles.stepContainer}>
        {isStepPrior('PASSWORD') ? 
          renderThisOrPriorStep('PASSWORD', 'Password', require('../../assets/key.png')) :
          renderOtherStep('Password', require('../../assets/key.png'))
        }
      </View>

      {/* AGREEMENT STEP */}
      <View style={styles.stepContainer}>
        {isStepPrior('AGREEMENT') ? 
          renderThisOrPriorStep('AGREEMENT', 'Agreement', require('../../assets/check-circle.png')) :
          renderOtherStep('Agreement', require('../../assets/check-circle.png'))
        }
      </View>

      {/* ADD SAVINGS STEP */}
      <View style={styles.stepContainer}>
        {isStepPrior('ADD_SAVINGS') ? 
          renderThisOrPriorStep('ADD_SAVINGS', 'Add Savings', require('../../assets/money-8.png')) :
          renderOtherStep('Add Savings', require('../../assets/money-8.png'))
        }
      </View>
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    paddingBottom: 10,
  },
  stepContainer: {
    width: '24%',
    marginRight: 4,
    height: 70,
    flexDirection: 'column',
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStepText: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.2 * FONT_UNIT,
    color: Colors.WHITE,
  },
  otherStepText: {
    fontFamily: 'poppins-regular',
    fontSize: 3.2 * FONT_UNIT,
    color: Colors.MEDIUM_GRAY,
  },
  stepIcon: {
    height: 22,
    width: 22,
    marginBottom: 5,
  },
  thisStepIcon: {
    tintColor: Colors.WHITE,
  },
  otherStepIcon: {
    tintColor: Colors.MEDIUM_GRAY,
  },
});

export default OnboardBreadCrumb;