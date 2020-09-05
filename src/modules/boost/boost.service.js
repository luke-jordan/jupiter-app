import { Endpoints } from '../../util/Values';
import { postRequest, getRequest } from '../auth/auth.helper';

export const boostService = {

    async sendTapGameResults({ boostId, numberTaps, percentDestroyed, timeTaken, authenticationToken }) {
        try {
            const timeTakenMillis = timeTaken * 1000; // at present, just the length of the game, but may change in future
            const url = `${Endpoints.CORE}boost/respond`;
            const params = {
              boostId,
              eventType: 'USER_GAME_COMPLETION',
              numberTaps,
              percentDestroyed,
              timeTakenMillis,
            };

            const result = await postRequest({ token: authenticationToken, url, params });
            if (result.ok) {
                const resultJson = await result.json();
                // console.log('Boost game submission result:', resultJson);
                const { result: serverResult, statusMet, endTime } = resultJson;
                
                const isBoostTriggered = serverResult && serverResult.includes('TRIGGERED');
                const isBoostRedeemed = isBoostTriggered && statusMet && statusMet.includes('REDEEMED');
                const isBoostPending = isBoostTriggered && statusMet && statusMet.includes('PENDING');
                
                const isBoostTounament = serverResult && serverResult.includes('TOURNAMENT_ENTERED');

                if (isBoostRedeemed) {
                    const amountRedeemed = resultJson.amountAllocated;
                    return { gameResult: 'REDEEMED', statusMet, amountWon: amountRedeemed };
                } else if (isBoostPending) {
                    return { gameResult: 'PENDING', statusMet, endTime };
                } else if (isBoostTounament) {
                    return { gameResult: 'PENDING', endTime };
                } else {
                    return { gameResult: 'FAILED', statusMet };
                }
            } else {
              const resultBody = await result.json();
              console.log('Message: ', resultBody);
              throw result;
            }
        } catch (error) {
            console.log('Error sending game results!', JSON.stringify(error));
        }
    },

    async sendQuizGameAnswers({ boostId, timeTaken, userResponses, token }) {
      try {
        const url = `${Endpoints.CORE}boost/respond`;
        const timeTakenMillis = timeTaken ? timeTaken * 1000 : 0; // since at first we do no-time-limit quizzes, hence everyone takes 0 time 
        const params = {
          eventType: 'USER_GAME_COMPLETION',
          boostId,
          timeTakenMillis,
          userResponses,
        };

        const result = await postRequest({ token, url, params });
        
        if (result.ok) {
            const resultJson = await result.json();
            // for the moment, no quiz tournament (but will come), so just check if redeemed, and return results
            const { result: serverResult, statusMet, resultOfQuiz } = resultJson;

            const isBoostTriggered = serverResult && serverResult.includes('TRIGGERED');
            const isBoostRedeemed = isBoostTriggered && statusMet && statusMet.includes('REDEEMED');

            return { isBoostTriggered, isBoostRedeemed, statusMet, resultOfQuiz };
        } else {
          const resultBody = await result.json();
          console.log('Error submitting quiz: ', resultBody);
          throw result;
        }
      } catch (error) {
          console.log('Error sending quiz results!', JSON.stringify(error));
      }    
    },

    async fetchBoostDetails(boostId, token) {
      try {
        const url = `${Endpoints.CORE}boost/detail`;
        const result = await getRequest({ token, url, params: { boostId }});
        if (!result.ok) {
          throw result;
        }
        const boostDetails = await result.json();
        return boostDetails;
      } catch (error) {
        console.log('Error fetching boost details: ', JSON.stringify(error));
        return null;
      }
    },

    convertBoostAndLogsToGameDetails(boostFromDisplayEndpoint) {
      if (boostFromDisplayEndpoint.boostType !== 'GAME') {
        return boostFromDisplayEndpoint;
      }

      const boost = { ...boostFromDisplayEndpoint };

      const { boostStatus, gameParams, gameLogs } = boost;
      
      let gameResult = 'FAILED';
      if (boostStatus === 'REDEEMED' || boostStatus === 'CONSOLED') {
        gameResult = boostStatus;
      }
      boost.gameResult = gameResult;
      boost.awardBasis = gameParams && gameParams.numberWinners ? 'TOURNAMENT' : 'THRESHOLD';

      const outcomeLogs = gameLogs ? gameLogs.filter((log) => log.logType === 'GAME_OUTCOME').
        sort((logA, logB) => logB.numberTaps - logA.numberTaps) : [];
            
      if (outcomeLogs && outcomeLogs.length > 0) {
        const firstLog = outcomeLogs[0];
        const gameLog = firstLog.logContext ? { ...firstLog, ...firstLog.logContext } : firstLog;
        Reflect.deleteProperty(gameLog, 'logContext');
        boost.gameLog = gameLog;
      }
      
      Reflect.deleteProperty(boost, 'gameLogs');

      return boost;
    },

};