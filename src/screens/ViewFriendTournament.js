import React from 'react';

import { StyleSheet, View, Text, ScrollView, ImageBackground } from 'react-native';

import { Colors } from '../util/Values';
import HeaderWithBack from '../elements/HeaderWithBack';

export default class ViewFriendTournament extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      scores: [],
    };
  }

  async componentDidMount() {
    const { params } = this.props.navigation.state;
    const { tournament } = params;

    const scores = tournament.tournamentScores.sort((scoreA, scoreB) => scoreB - scoreA)
      .map((score, index) => ({ ...score, playerRank: index + 1 }));
    const scoreType = tournament.boostCategory === 'DESTROY_IMAGE' ? 'PERCENT' : 'TAPS';

    this.setState({
      tournament,
      scores,
      scoreType,
    });
  }

  renderScoreLine(playerName, playerScore, playerRank) {
    return (
      <View style={styles.playerWrapper} key={playerRank}>
        <Text style={styles.rank}>{playerRank}</Text>
        <Text style={styles.name}>{playerName === 'SELF' ? 'You' : playerName}</Text>
        <ImageBackground
          source={require('../../assets/gradient_background.png')}
          style={styles.scoreHolder}
        >
          <Text style={styles.score}>{playerScore}{this.state.scoreType === 'PERCENT' && '%'}</Text>
        </ImageBackground>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderWithBack
          headerText="Tournament Scores"
          onPressBack={() => this.props.navigation.navigate('Friends')}
        />
        {this.state.tournament && (
          <ScrollView>
            <Text style={styles.labelPrefill}>Current scores for:</Text>
            <Text style={styles.tournamentLabel}>{this.state.tournament.label}</Text>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreColumnTitles}>
                <Text style={styles.rankTitle}>Rank</Text>
                <Text style={styles.nameTitle}>Player</Text>
                <Text style={styles.scoreTitle}>Score</Text>
              </View>
              {this.state.scores.map((score) => this.renderScoreLine(score.playerName, score.playerScore, score.playerRank))}
            </View>
          </ScrollView>
        )}
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  labelPrefill: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    lineHeight: 22,
    color: Colors.MEDIUM_GRAY,
    marginHorizontal: 15,
    marginTop: 25,
    textAlign: 'center',
  },
  tournamentLabel: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 32,
    marginTop: 10,
    marginBottom: 20,
    color: Colors.DARK_GRAY,
    marginHorizontal: 15,
    textAlign: 'center',
  },
  scoreContainer: {
    width: '100%',
    alignContent: 'center',
  },
  scoreColumnTitles: {
    flexDirection: 'row',
    alignContent: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  playerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    
    width: '100%',
    
    paddingVertical: 15,
    marginBottom: 10,
    paddingHorizontal: 15,

    backgroundColor: Colors.WHITE,

    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  rankTitle: {
    width: 45,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'left',
  },
  rank: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.PURPLE,
    marginEnd: 15,
    width: 35,
    textAlign: 'center',
  },
  nameTitle: {
    flex: 1,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'left',
  },
  name: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
    flex: 1,
  },
  scoreTitle: {
    width: 40,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'left',
  },
  scoreHolder: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.WHITE,
    textAlign: 'center',

  },
});
