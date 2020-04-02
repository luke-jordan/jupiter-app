import { Endpoints } from '../../util/Values';

export const boostService = {

    async sendTapGameResults({ boostId, numberTaps, timeTaken, authenticationToken }) {
        try {
            const timeTakenMillis = timeTaken * 1000; // at present, just the length of the game, but may change in future
            const result = await fetch(`${Endpoints.CORE}boost/respond`, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${authenticationToken}`,
                },
                method: 'POST',
                body: JSON.stringify({
                    boostId,
                    eventType: 'USER_GAME_COMPLETION',
                    numberTaps,
                    timeTakenMillis,
                }),
            });

            if (result.ok) {
                const resultJson = await result.json();
                console.log('Boost game submission result:', resultJson);
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
                throw result;
            }
        } catch (error) {
            console.log('Error sending game results!', JSON.stringify(error));
        }
    },

    convertBoostAndLogsToGameDetails(boostFromDisplayEndpoint) {
      if (boostFromDisplayEndpoint.boostType !== 'GAME') {
        return boostFromDisplayEndpoint;
      }

      const boost = { ...boostFromDisplayEndpoint };

      const { gameParams, gameLogs } = boost; 
      boost.gameResult = boost.boostStatus === 'REDEEMED' ? 'REDEEMED' : 'FAILED';
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