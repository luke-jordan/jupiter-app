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
                // console.log("resultJson:", resultJson);
                const { result: serverResult, statusMet } = resultJson;
                
                const isBoostTriggered = serverResult && serverResult.includes('TRIGGERED');
                const isBoostRedeemed = isBoostTriggered && statusMet && statusMet.includes('REDEEMED');
                const isBoostPending = isBoostTriggered && statusMet && statusMet.includes('PENDING');

                if (isBoostRedeemed) {
                    const amountRedeemed = resultJson.amountAllocated;
                    return { gameResult: 'REDEEMED', statusMet, amountWon: amountRedeemed };
                } else if (isBoostPending) {
                    return { gameResult: 'PENDING', statusMet };
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

};