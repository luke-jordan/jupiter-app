/* eslint-disable react/sort-comp */
import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from 'react-native-elements';

import ProgressCircle from 'react-native-progress-circle';

import { boostService } from '../modules/boost/boost.service';

import { LoggingUtil } from '../util/LoggingUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { updateBoostViewed } from '../modules/boost/boost.actions';
import { updateServerBalance } from '../modules/balance/balance.actions';

import { Colors, Endpoints } from '../util/Values';
import { getRequest } from '../modules/auth/auth.helper';

import NextArrow from '../../assets/gold_next.png';
import ScoreImage from '../../assets/score-image.png';
import { NavigationUtil } from '../util/NavigationUtil';

// feels like one more of these and we should create a holding component to reuse
// but for the moment, they are simple enough, and repeating elements are just a few lines
// and we'd have to pass some really complicated stuff in the parameters, so this is for now

const mapStateToProps = state => ({
  token: getAuthToken(state),
});

const mapPropsToDispatch = {
  updateBoostViewed,
  updateServerBalance,
};

const randomOrderArray = (answerOptions) => {
  // there are much better ways to shuffle an array but this is three elements, so doing something very basic
  const randomScored = answerOptions.map((answerText) => ({ answerText, random: Math.random() }));
  return randomScored.sort((answerA, answerB) => answerA.random - answerB.random).map(({ answerText }) => answerText); 
};

const turnSnippetIntoQuestion = (snippet) => {
  const { snippetId, body: question, responseOptions } = snippet;

  const rawAnswers = responseOptions.responseTexts;
  const answers = randomOrderArray(rawAnswers);
  answers.push(`I don't know`);

  return { snippetId, question, answers };
}

class QuizGame extends React.PureComponent {
  
  constructor(props) {
    super(props);


    this.state = {
      questions: [],
      
      fetchingQuestions: true,
      errorFetchingQuestions: false,

      currentIndex: 0,
      currentQuestion: {},
      
      currentAnswerIndex: -1,
      selectedAnswers: {},

      showSubmittingModal: false,
      showGameResultOverlay: false, // will cover all screen (hence distinguishing)
    }
  }

  async componentDidMount() {
    const gameParams = this.props.navigation.getParam('gameParams');
    if (!gameParams) {
      LoggingUtil.logError(Error('Match game initiated with no parameters'));
      return;
    }

    this.setState({
      requiredPercent: gameParams.winningThreshold,
    });

    console.log('Need correct: ', gameParams.winningThreshold);

    const { boostId } = gameParams;
    this.fetchAndLoadQuestions(boostId);  
    LoggingUtil.logEvent('USER_PLAYED_QUIZ_GAME'); 
  }

  async fetchAndLoadQuestions(boostId) {
    const questionSnippets = await this.fetchQuizQuestions(boostId);

    if (!questionSnippets) {
      this.setState({ boostId, fetchingQuestions: false, errorFetchingQuestions: true });
      LoggingUtil.logError('Error fetching quiz game questions');
    }

    const questions = questionSnippets.map(turnSnippetIntoQuestion);

    this.setState({
      boostId,
      questions,
      fetchingQuestions: false,
      errorFetchingQuestions: false,
    }, () => this.startGame());
  }

  async fetchQuizQuestions(boostId) {
    const boostDetails = await boostService.fetchBoostDetails(boostId, this.props.token); 
    if (!boostDetails) {
      return null;
    }

    return boostDetails.questionSnippets;
  }

  startGame() {
    this.setState({ 
      currentIndex: 0,
      currentQuestion: this.state.questions[0],
      currentAnswerIndex: -1,
      startTime: (new Date()).getTime(),
    });
  }

  onSelectAnswer = (answerIndex) => {
    this.setState({ 
      currentAnswerIndex: answerIndex,
    })
  }

  onPressNext = () => {
    const { currentIndex, questions, currentQuestion, currentAnswerIndex } = this.state;
    if (currentAnswerIndex < 0) {
      this.setState({ noAnswerSelectedError: true });
      return;
    }
    
    const selectedAnswers = { ...this.state.selectedAnswers };
    selectedAnswers[currentQuestion.snippetId] = currentQuestion.answers[currentAnswerIndex];

    const newIndex = currentIndex + 1;
    if (newIndex === questions.length) {
      this.setState({ selectedAnswers, showSubmittingModal: true }, () => this.submitGameResults());
    } else {
      this.setState({ 
        selectedAnswers,
        currentQuestion: questions[newIndex], 
        currentIndex: newIndex,
        currentAnswerIndex: -1, // so it removes the highlight
      });
    } 
  }

  renderAnswerOption(answerText, index) {
    const isSelected = index === this.state.currentAnswerIndex;
    const selectionText = `${String.fromCharCode(index + 'A'.charCodeAt(0))}. ${answerText}`;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.onSelectAnswer(index)}
        disabled={isSelected}
        style={[isSelected ? styles.selectedAnswerHolder : styles.unselectedAnswerHolder, styles.answerShadow]}
      >
        <Text style={isSelected ? styles.selectedAnswerText : styles.unselectedAnswerText}>{ selectionText }</Text>
      </TouchableOpacity>
    )
  }

  renderQuestionAndAnswer() {
    const { currentQuestion, currentIndex } = this.state; 
    if (!currentQuestion || Object.keys(currentQuestion).length === 0) {
      return null;
    }

    return (
      <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContainer}>
        <Text style={styles.questionCount}>{currentIndex + 1} of {this.state.questions.length}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.answers && currentQuestion.answers.map((answer, index) => this.renderAnswerOption(answer, index))}
        {this.state.noAnswerSelectedError && <Text style={styles.noAnswerError}>Please select an answer (even &quot;I don&apos;t know) to continue</Text>}
        <View style={styles.questionFooter}>
          <TouchableOpacity style={styles.questionNext} onPress={this.onPressNext}>
            <Text style={styles.nextText}>Next</Text>
            <Image style={styles.nextArrow} source={NextArrow} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  async submitGameResults() {
    const { boostId, selectedAnswers, startTime } = this.state;
    const userResponses = Object.keys(selectedAnswers).map((snippetId) => ({ snippetId, userAnswerText: selectedAnswers[snippetId] }));
    const timeTaken = Math.round(((new Date).getTime() - startTime) / 1000);

    const resultOptions = {
      boostId,
      timeTaken,
      userResponses,
      token: this.props.token,
    }

    const resultOfSubmission = await boostService.sendQuizGameAnswers(resultOptions);

    if (!resultOfSubmission) {
      LoggingUtil.logError(Error('Result of game was null'));
      this.showErrorDialog();
      return;
    }

    const { statusMet } = resultOfSubmission;
    if (Array.isArray(statusMet) && statusMet.length > 0) {
      statusMet.forEach((viewedStatus) => this.props.updateBoostViewed({ boostId, viewedStatus }));
    }

    this.displayGameResult(resultOfSubmission);
  }

  displayGameResult(gameResult) {
    const { isBoostRedeemed, resultOfQuiz } = gameResult;
    
    this.setState({
      showSubmittingModal: false,
      showGameResultOverlay: true,
      isBoostRedeemed,
      numberCorrectAnswers: resultOfQuiz.numberCorrectAnswers,
    });

    if (isBoostRedeemed) {
      this.updateBalance();
    }
  }

  onPressDone = () => {
    if (this.state.isBoostRedeemed) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home', { makeWheelGold: true });
    } else {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home');
    }
  }

  onPressBoosts = () => {
    NavigationUtil.navigateWithHomeBackstack(this.props.navigation, 'Boosts');
  }

  onPressErrorGoHome = () => {
    this.setState({ showErrorDialog: false });
    this.props.navigation.navigate('Home');
  }

  onPressErrorSupport = () => {
    this.setState({ showErrorDialog: false });
    this.props.navigation.navigate('Support');
  }

  showErrorDialog() {
    this.setState({ showSubmittingModal: false, showErrorDialog: true });
  }

  renderGameResultOverlay() {
    const numberQuestions = this.state.questions.length;
    const numberCorrect = this.state.numberCorrectAnswers;
    
    const percentCorrect = numberQuestions > 0 && typeof numberCorrect === 'number' ? Math.round((numberCorrect / numberQuestions) * 100): 0;
    const numberNeeded = Math.floor((this.state.requiredPercent) * this.state.questions.length / 100);

    return (
      // leave this full screen
      <Modal 
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.quizResultOverlay}>
          <Image style={styles.resultImage} source={ScoreImage} />
          {this.state.isBoostRedeemed ? (
            <>
              <Text style={styles.resultHeader}>Congratulations!</Text>
              <Text style={styles.resultBody}>
                You got {this.state.numberCorrectAnswers} correct out of {this.state.questions.length}, and won the quiz! Well done, and keep learning and saving!
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.resultHeader}>Your Score</Text>
              <Text style={styles.resultBody}>Thank you for taking the quiz!</Text>
              <Text style={styles.resultBody}>
                You needed a score of at least {numberNeeded}/{this.state.questions.length} to win the boost. Better luck next time!
              </Text>
            </>
          )}
          <ProgressCircle 
            percent={percentCorrect}
            radius={60}
            borderWidth={8}
            color={Colors.GOLD}
            shadowColor={Colors.LIGHT_GRAY}
            bgColor={Colors.WHITE}
            outerCircleStyle={styles.resultScoreCircle}
          >
            <Text style={styles.resultScoreText}>{numberCorrect}/{numberQuestions}</Text>
          </ProgressCircle>
          <Button
            title="CLOSE"
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={this.onPressDone}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
          <Text style={styles.resultFooterLink} onPress={this.onPressBoosts}>View boosts</Text>
        </View>
      </Modal>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
          style={styles.gradientContainer}
        >
          {this.state.fetchingQuestions && (
            <Text style={styles.fetchingQuizText}>Fetching quiz questions...</Text>
          )}

          {this.state.errorFetchingQuestions && (
          <>
            <Text style={styles.fetchingQuizText}>
              Sorry, there was an error fetching the quiz. You can try fetching again, or playing later.
            </Text>
            <Button 
              title="TRY AGAIN"
              onPress={() => this.setState({ fetchingQuestions: true, errorFetchingQuestions: false }, () => this.fetchAndLoadQuestions(this.state.boostId))}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
            />
            <Button 
              title="HOME"
              onPress={this.onPressErrorGoHome}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
            />
          </>
          )}
          
          {this.state.currentQuestion && this.renderQuestionAndAnswer()}
          
          {this.state.showSubmittingModal && (
            <Modal
              animationType="slide"
              transparent
              visible={this.state.showSubmittingModal}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Submitting...</Text>
              </View>
            </Modal>
          )}

          {this.state.showGameResultOverlay && this.renderGameResultOverlay()}

          {this.state.showErrorDialog && (
            <Modal
              animationType="slide"
              transparent
              visible={this.state.showErrorDialog}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Sorry! There was an error submitting the game.
                  Please <Text style={styles.modalLink} onPress={this.onPressErrorSupport}>contact support</Text> or go{' '}
                  <Text onPress={this.onPressErrorGoHome} style={styles.modalLink}>back to home</Text>
                </Text>
              </View>
            </Modal>
          )}
        </LinearGradient>
      </View>
    );
  }

  // on a proper refactor, really need to move this into a service
  async updateBalance() {
    try {
      const balanceResult = await getRequest({ token: this.props.token, url: `${Endpoints.CORE}balance` });
      if (!balanceResult.ok) {
        LoggingUtil.logApiError('balance', balanceResult);
        throw balanceResult;
      }
      const serverBalance = await balanceResult.json();
      this.props.updateServerBalance(serverBalance);
    } catch (err) {
      console.log('ERROR fetching new balance: ', JSON.stringify(err));
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  fetchingQuizText: {
    fontFamily: 'poppins-semibold',
    color: Colors.WHITE,
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  questionContainer: {
    paddingHorizontal: 15,
    minHeight: '100%',
    paddingVertical: 20,
  },
  questionCount: {
    fontFamily: 'poppins-regular',
    color: Colors.WHITE,
    fontSize: 10,
    marginBottom: 5,
  },
  questionText: {
    fontFamily: 'poppins-regular',
    fontSize: 20,
    color: Colors.WHITE,
    lineHeight: 30,
    marginBottom: 10,
  },
  unselectedAnswerHolder: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    borderRadius: 4,
    padding: 15,
    marginTop: 15,
    marginBottom: 5,
  },
  selectedAnswerHolder: {
    width: '100%',
    backgroundColor: Colors.GOLD,
    borderRadius: 4,
    padding: 15,
    marginTop: 15,
    marginBottom: 5,
  },
  answerShadow: {
    shadowColor: Colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unselectedAnswerText: {
    fontFamily: 'poppins-regular',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.DARK_GRAY,
  },
  selectedAnswerText: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.WHITE,
  },
  questionFooter: {
    flex: 1,
    marginTop: 30,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width: '100%',
  },
  questionNext: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextText: {
    fontFamily: 'poppins-semibold',
    color: Colors.WHITE,
    textTransform: 'uppercase',
    fontSize: 18,
    marginRight: 8,
  },
  noAnswerError: {
    marginTop: 10,
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.WHITE,
  },
  quizResultOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  resultImage: {
    marginBottom: 20,
  },
  resultHeader: {
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    textAlign: 'center',
    width: '100%',
    fontSize: 25,
    marginBottom: 8,
  },
  resultScoreCircle: {
    marginVertical: 15,
  },
  resultBody: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  resultScoreText: {
    fontFamily: 'poppins-semibold',
    fontSize: 22,
    color: Colors.GOLD,
  },
  resultFooterLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: Colors.PURPLE,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  modalContent: {
    marginTop: 'auto',
    marginHorizontal: 40,
    marginBottom: 'auto',
    minHeight: 120,
    backgroundColor: Colors.WHITE,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalText: {
    color: Colors.DARK_GRAY,
    fontSize: 20,
    fontFamily: 'poppins-semibold',
    marginTop: 'auto',
    marginBottom: 'auto',
    padding: 10,
  },
  modalLink: {
    color: Colors.PURPLE,
  },
  buttonTitleStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 176,
  },
  buttonContainerStyle: {
    paddingTop: 18,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default connect(mapStateToProps, mapPropsToDispatch)(QuizGame);
