import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import GameResultModal from '../elements/boost/GameResultModal';

import { boostService } from '../modules/boost/boost.service';

import { LoggingUtil } from '../util/LoggingUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { updateBoostViewed } from '../modules/boost/boost.actions';
import { updateServerBalance } from '../modules/balance/balance.actions';

import { Colors, Endpoints } from '../util/Values';
import { getRequest } from '../modules/auth/auth.helper';

const { width, height } = Dimensions.get('window');

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

  return { snippetId, question, answers };
}

class QuizGame extends React.PureComponent {
  
  constructor(props) {
    super(props);


    this.state = {
      questions: [],

      currentIndex: 0,
      currentQuestion: {},
      
      currentAnswerIndex: -1,
      selectedAnswers: {},

      showSubmittingModal: false,
      showGameResultDialog: false,
    }
  }

  async componentDidMount() {
    const gameParams = this.props.navigation.getParam('gameParams');
    if (!gameParams) {
      LoggingUtil.logError(Error('Match game initiated with no parameters'));
      return;
    }

    const { boostId, questionSnippets } = gameParams;
    const questions = questionSnippets.map(turnSnippetIntoQuestion);

    this.setState({
      boostId,
      questions,
    });

    LoggingUtil.logEvent('USER_PLAYED_QUIZ_GAME');
  }

  // eslint-disable-next-line react/sort-comp
  startGame() {
    this.setState({ 
      currentIndex: 0,
      currentQuestion: this.state.questions[0],
      currentAnswerIndex: -1,
    });
  }

  onSelectAnswer = (questionIndex) => {
    this.setState({ 
      currentAnswerIndex: questionIndex,
    })
  }

  onPressNext = () => {
    const { currentIndex, questions, currentQuestion, currentAnswerIndex } = this.state;
    
    const selectedAnswers = { ...this.state.selectedAnswers };
    selectedAnswers[currentQuestion.snippetId] = currentQuestion.answers[currentAnswerIndex]
    
    this.setState({ 
      selectedAnswers,
      currentQuestion: questions[currentIndex], 
      currentIndex: currentIndex + 1,
      currentAnswerIndex: -1, // so it removes that
    });
  }

  renderAnswerOption(answerText, index) {
    const isSelected = index === this.state.currentAnswerIndex;
    const selectionText = `${String.fromCharCode(0 + 'A'.charCodeAt(0))}. ${answerText}`;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.onSelectAnswer(index)}
        disabled={!isSelected}
        style={isSelected ? styles.selectedAnswerHolder : styles.unselectedAnswerHolder}
      >
        <Text style={isSelected ? styles.selectedAnswerText : styles.unselectedAnswerText}>{ selectionText }</Text>
      </TouchableOpacity>
    )
  }

  renderQuestionAndAnswer() {
    const { currentQuestion, currentIndex } = this.state; 
    if (!currentQuestion) {
      return null;
    }

    return (
      <>
        <Text style={styles.questionCount}>{currentIndex + 1} of {this.state.questions.length}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.answers.map((answer, index) => this.renderAnswerOption(answer, index))}
        <View style={styles.questionFooter}>
          <TouchableOpacity style={styles.questionNext} onPress={this.onPressNext}>
            <Text style={styles.nextText}>Next</Text>
            <Image style={styles.nextArrow} />
          </TouchableOpacity>
        </View>
      </>
    )
  }

  async submitGameResults() {
    const { selectedAnswers } = this.state;
    const userResponses = Object.keys(selectedAnswers).map((snippetId) => ({ snippetId, userAnswerText: selectedAnswers[snippetId] }));

    const resultOptions = {
      timeTaken: this.state.timeLimit,
      boostId: this.state.boostId,
      authenticationToken: this.props.token,
      userResponses,
    }

    const resultOfSubmission = await boostService.sendQuizGameAnswers(resultOptions);
    if (!resultOfSubmission) {
      LoggingUtil.logError(Error('Result of game was null'));
      this.showErrorDialog();
    }

    this.showGameResultDialog(resultOfSubmission);
  }

  render() {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
          style={styles.gradientContainer}
        >
          {this.state.currentQuestion && this.renderQuestionAndAnswer()}
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
          {this.state.showGameResultDialog && (
          <GameResultModal
            showModal={this.state.showGameResultDialog}
            resultOfGame={this.state.gameResultParams}
            onPressViewOtherBoosts={this.onPressBoosts}
            onCloseGameDialog={this.onPressDone}
          />
          )}

        </LinearGradient>
      </View>
    );
  }

  handleGameEnd() {
    this.setState({ showSubmittingModal: true }, () => {
      this.submitGameResults();
    });
  }

  onPressDone = () => {
    this.setState({ showGameResultDialog: false, gameResultParams: null });
    this.props.navigation.navigate('Home', { makeWheelGold: true });
  }

  onPressBoosts = () => {
    this.setState({ showGameResultDialog: false, gameResultParams: null });
    this.props.navigation.navigate('Boosts');
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

  async showGameResultDialog(resultOfGame) {
    const { amountWon, statusMet } = resultOfGame;
    const gameResultParams = { ...resultOfGame, numberOfMatches: this.state.matchCounter, timeTaken: this.state.timeLimit };

    if (amountWon) {
      await this.updateBalance();
    }

    this.setState({
      showSubmittingModal: false,
      showGameResultDialog: true,
      gameResultParams,
    });

    if (Array.isArray(statusMet) && statusMet.length > 0) {
      statusMet.forEach((viewedStatus) => this.props.updateBoostViewed({ boostId: this.state.boostId, viewedStatus }));
    }
  }

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
  },
  // gameHeader: {
  //   fontFamily: 'poppins-regular',
  //   fontSize: height > 640 ? 24 : 20,
  //   lineHeight: 30,
  //   color: Colors.WHITE, 
  //   width: '100%',
  //   textAlign: 'center',
  //   marginTop: height > 640 ? 30 : 15,
  //   marginBottom: height > 640 ? 10 : 5,
  // },
  // footerWithCounters: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   width: '100%',
  //   marginTop: height > 640 ? 15: 5,
  //   paddingHorizontal: 15,
  //   marginBottom: height > 640 ? 15 : 0,
  // },
  // gameTimerHolder: {
  //   justifyContent: 'flex-end',
  // },
  // gameTimerTitle: {
  //   textTransform: 'uppercase',
  //   fontFamily: 'poppins-semibold',
  //   fontSize: 13,
  //   color: Colors.WHITE,
  // },
  // gameTimer: {
  //   fontFamily: 'poppins-regular',
  //   color: Colors.GOLD,
  //   fontSize: 30,
  //   width: '100%',
  //   textAlign: 'right',
  // },
  // tileHolder: {
  //   minWidth: TILE_WIDTH,
  //   minHeight: TILE_HEIGHT,
  //   borderRadius: 4,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderWidth: 1,
  //   borderColor: Colors.BACKGROUND_GRAY,
  // },
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
});

export default connect(mapStateToProps, mapPropsToDispatch)(QuizGame);
