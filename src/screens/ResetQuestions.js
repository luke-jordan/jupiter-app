import React from 'react';
import { Dimensions, Text, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Input } from 'react-native-elements';

import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class ResetQuestions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      answers: [],
      questions: [],
      loading: false,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_PWORD_RESET_QS');
    const questions = this.props.navigation.getParam('questions');

    const { answers } = this.state;
    for (const question of questions.questionsToAnswer) {
      answers[question.questionKey] = '';
    }
    this.setState({
      answers,
      questions: questions.questionsToAnswer,
      systemWideUserId: questions.systemWideUserId,
    });
  }

  onPressContinue = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    const bodyArray = [];
    for (const answerKey in this.state.answers) {
      bodyArray[answerKey] = this.state.answers[answerKey];
    }
    try {
      const result = await fetch(`${Endpoints.AUTH}password/reset/answerqs`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(bodyArray),
      });
      if (result.ok) {
        this.setState({ loading: false });
        const resultJson = await result.json();
        if (resultJson.result.includes('SUCCESS')) {
          NavigationUtil.navigateWithoutBackstack(
            this.props.navigation,
            'SetPassword',
            { systemWideUserId: this.state.systemWideUserId, isReset: true }
          );
        } else {
          this.showError();
        }
      } else {
        throw result;
      }
    } catch (error) {
      this.showError();
    }
  };

  onChangeAnswer = (text, question) => {
    const answers = { ...this.state.answers };
    answers[question.questionKey] = text;
    this.setState({
      answers,
      hasError: false,
    });
  };

  getQuestionPlaceholder = question => {
    if (question.placeholder) {
      return question.placeholder;
    }
    switch (question.questionKey) {
      case 'MONTH_OPEN':
        return 'e.g. August 2019';

      case 'CURRENT_BALANCE':
        return 'e.g. 123.45';

      case 'MONTHLY_SAVING_EVENTS':
        return 'e.g. 8';

      default:
        return '';
    }
  };

  onPressLogin = () => {
    NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Login');
  };

  showError() {
    this.setState({
      loading: false,
      hasError: true,
    });
  }

  renderQuestion(index, question) {
    return (
      <View style={styles.inputWrapper} key={index}>
        <Text style={styles.labelStyle}>{question.questionPhrase}</Text>
        <Input
          value={this.state.answers[question.questionKey]}
          placeholder={this.getQuestionPlaceholder(question)}
          onChangeText={text => this.onChangeAnswer(text, question)}
          inputContainerStyle={styles.inputContainerStyle}
          inputStyle={styles.inputStyle}
          containerStyle={styles.containerStyle}
        />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerText}>
            For security reasons, please answer the following questions before
            resetting your password.
          </Text>
        </View>
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentContainer}
        >
          {this.state.questions && this.state.questions.length > 0
            ? this.state.questions.map((item, index) =>
                this.renderQuestion(index, item)
              )
            : null}
        </ScrollView>
        {this.state.hasError ? (
          <Text style={styles.errorMessage}>
            Some of your answers might be incorrect.
          </Text>
        ) : null}
        <Text style={styles.goback} onPress={this.onPressLogin}>
          Go to Login
        </Text>
        <Button
          title="CONTINUE"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressContinue}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
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
    backgroundColor: Colors.WHITE,
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 6.4 * FONT_UNIT,
    marginBottom: 5,
    color: Colors.DARK_GRAY,
  },
  headerText: {
    fontFamily: 'poppins-regular',
    fontSize: 3.4 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    color: Colors.MEDIUM_GRAY,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  buttonContainerStyle: {
    marginVertical: 15,
    justifyContent: 'center',
    width: '90%',
  },
  mainContent: {
    width: '90%',
  },
  mainContentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  labelStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.2 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    color: Colors.MEDIUM_GRAY,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    backgroundColor: Colors.WHITE,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 12,
    marginTop: -15, // this is valid because of the exact alignment of other elements - do not reuse in other components
    marginBottom: 20,
  },
  goback: {
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
  },
});
