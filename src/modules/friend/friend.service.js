import { Endpoints } from '../../util/Values';
import { getRequest, postRequest } from '../auth/auth.helper';

import { getConvertor } from '../../util/AmountUtil';

import { LoggingUtil } from '../../util/LoggingUtil';

const transformBoostToTournament = (boost) => ({
  boostId: boost.boostId,
  label: boost.label,
  endTime: boost.endTime,
  boostStatus: boost.boostStatus,
  gameParams: boost.gameParams,
  boostCategory: boost.boostCategory,
  percentPoolAsReward: boost.rewardParameters ? boost.rewardParameters.percentPoolAsReward : 0,
  poolContributionPerUser: boost.rewardParameters ? boost.rewardParameters.poolContributionPerUser : {},
});

export const friendService = {

  DEFAULT_TEXT_MESSAGE: `The Jupiter Savings app REWARDS me for saving & gives a GREAT interest rate! ` +
    `If you join me as my savings buddy, we can earn EXTRA rewards!`,

  sharingMessage(referralCode, baseMessage = this.DEFAULT_TEXT_MESSAGE) {
    // const referralLink = `${Endpoints.MESSAGES}/referral/${referralCode}`;
    const suffix = `Just use my referral code, ${referralCode}, after downloading here: ${Endpoints.DOWNLOAD}`;
    return `${baseMessage} ${suffix}`;
  },

  async fetchFriendList(token) {
    try {
      const url = `${Endpoints.CORE}friend/list`;
      const result = await getRequest({ token, url });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }

      return result.json();
    } catch (err) {
      console.log('ERROR: fetching friends: ', JSON.stringify(err));
    }
  },

  async fetchReferralData(token) {
    try {
      const url = `${Endpoints.CORE}friend/request/referral`;
      const result = await getRequest({ token, url });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return result.json();
    } catch (err) {
      console.log('ERROR: fetching referral data: ', JSON.stringify(err));
    }
  },

  async fetchFriendReqList(token) {
    try {
      const url = `${Endpoints.CORE}friend/request/list`;
      const result = await getRequest({ token, url });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }

      return result.json();
    } catch (err) {
      console.log('Error fetching friend requests: ', JSON.stringify(err));
    }
  },

  async seekPotentialFriend({ token, phoneOrEmail }) {
    try {
      const url = `${Endpoints.CORE}friend/request/seek`;
      const result = await getRequest({ token, url, params: { phoneOrEmail }});
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }

      const { systemWideUserId, targetUserName } = await result.json();
      return { result: 'USER_FOUND', systemWideUserId, targetUserName  };
    } catch (err) {
      // console.log('Error seeking friend: ', JSON.stringify(err));
      return { result: 'USER_NOT_FOUND' };
    }
  },

  async initiateFriendRequest({ token, targetPhoneOrEmail, targetUserId, sharingLevel, sharingMessage }) {
    try {
      const url = `${Endpoints.CORE}friend/request/initiate`;
      const requestedShareItems = ['ACTIVITY_LEVEL', 'ACTIVITY_COUNT']; // baseline
      
      if (sharingLevel.shareActivity) {
        requestedShareItems.push('LAST_ACTIVITY');
      }
      
      if (sharingLevel.shareAmount) {
        requestedShareItems.push('SAVE_VALUES');
      }

      const params = { targetPhoneOrEmail, targetUserId, requestedShareItems, customShareMessage: sharingMessage };
      // console.log('Initiating invite with parameters: ', params);
      
      const apiResult = await postRequest({ token, url, params });
      if (!apiResult.ok) {
        LoggingUtil.logApiError(url, apiResult);
        throw apiResult;
      }

      const formedRequest = await apiResult.json();
      return { result: 'SUCCESS', request: formedRequest };
    } catch (err) {
      console.log('Error posting friend request: ', JSON.stringify(err));
      return { result: 'FAILED' };
    }
  },

  async acceptFriendRequest(token, requestId, sharingLevel) {
    try {
      const url = `${Endpoints.CORE}friend/request/accept`;
      const acceptedShareItems = [];
      if (sharingLevel.shareActivity) {
        acceptedShareItems.push('LAST_ACTIVITY');
      }
      if (sharingLevel.shareAmount) {
        acceptedShareItems.push('LAST_AMOUNT');
      }

      const params = { requestId, acceptedShareItems };
      // console.log('Sending: ', params);
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return result.json(); // todo : return the new friendship
    } catch (err) {
      console.log('Error accepting friend request: ', JSON.stringify(err));
      return false;
    }
  },

  async ignoreFriendRequest(token, requestId) {
    try {
      console.log('Ignoring friend request');
      const url = `${Endpoints.CORE}friend/request/ignore`;
      const result = await postRequest({ token, url, params: { requestId }});
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return true;
    } catch (err) {
      console.log('Error ignoring friend request: ', JSON.stringify(err));
      return false;
    }
  },

  async deactivateFriendship(token, friendshipId) {
    try {
      const url = `${Endpoints.CORE}friend/deactivate`;
      const params = { relationshipId: friendshipId };
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return true;
    } catch (err) {
      console.log('Error deactivating friendship: ', JSON.stringify(err));
    }
  },

  async cancelSentFriendRequest(token, requestId) {
    try {
      const url = `${Endpoints.CORE}friend/request/cancel`;
      const params = { requestId };
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return true;
    } catch (err) {
      console.log('Error cancelling request: ', JSON.stringify(err));
      return false;
    }
  },

  async connectFriendRequest(token, enteredRequestCode) {
    const url = `${Endpoints.CORE}friend/request/connect`;
    try {
      const requestCode = enteredRequestCode.trim().toUpperCase();
      const params = { requestCode };
      // console.log('Sending params: ', params);
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        // means nothing returned, e.g., a 404
        return false;
      }
      const { result: connectResult } = await result.json();
      if (connectResult === 'SUCCESS') {
        return true;
      }
      return false;
    } catch (err) {
      console.log('Error connecting request: ', JSON.stringify(err));
      LoggingUtil.logApiError(url, err);
      return false;
    }
  },

  async checkForFriendAlert(token) {
    try {
      const url = `${Endpoints.CORE}friend/alert/fetch`;
      const result = await getRequest({ token, url });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return result.json();
    } catch (err) {
      console.log('Error fetching alerts: ', JSON.stringify(err));
      return false;
    }
  },

  async postFriendAlertsProcessed(token, logIds) {
    if (!logIds || logIds.length === 0) {
      return;
    }
    
    try {
      const url = `${Endpoints.CORE}friend/alert/viewed`;
      const result = await postRequest({ token, url, params: { logIds }});
      // console.log('And ? : ', JSON.stringify(result));
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return true; // we don't need to do anything with it at present
    } catch (err) {
      console.log('Error marking alerts as seen: ', JSON.stringify(err));
      return false;
    }
  },

  async fetchFriendSavingPools(token) {
    try {
      const url = `${Endpoints.CORE}friend/pool/read/list`;
      const result = await getRequest({ url, token });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      const { currentSavingPools } = await result.json();
      if (!Array.isArray(currentSavingPools)) {
        console.log('No saving pools sent from server');
        return [];
      }

      return currentSavingPools.map((pool) => ({
        ...pool,
        percentComplete: pool.current && pool.target 
          ? (pool.current.amount * getConvertor(pool.current.unit, pool.target.unit) / pool.target.amount) : 0,
      }));
    } catch (err) {
      console.log('Error fetching saving pools: ', JSON.stringify(err));
      return [];
    }
  },

  async fetchSavingPoolDetails(token, savingPoolId) {
    try {
      const url = `${Endpoints.CORE}friend/pool/read/fetch`;
      const result = await getRequest({ token, url, params: { savingPoolId } });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return result.json();
    } catch (err) {
      console.log('Error fetching pool details: ', JSON.stringify(err));
      return null;
    }
  },

  async createSavingPool({ token, name, target, friendships }) {
    try {
      const url = `${Endpoints.CORE}friend/pool/write/create`;
      const params = { name, target, friendships };
      console.log('Submitting with params: ', params);
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      const resultBody = await result.json();
      if (resultBody.result !== 'SUCCESS') {
        console.log('Error creating pool: ', resultBody);
        return null;
      } 
      return resultBody.createdSavingPool;
    } catch (err) {
      console.log('Error creating pool: ', JSON.stringify(err));
      return null;
    }
  },

  async addFriendToSavingPool({ token, savingPoolId, friendshipsToAdd }) {
    try {
      const url = `${Endpoints.CORE}friend/pool/write/update`;
      const params = { savingPoolId, friendshipsToAdd };
      // console.log('Submitting with params: ', params);
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      const { result: serverResult } = await result.json();
      return serverResult === 'SUCCESS';
    } catch (err) {
      console.log('Error adding friend to pool: ', JSON.stringify(err));
      return false;
    }
  },

  async deactivateSavingPool({ token, savingPoolId }) {
    try {
      const url = `${Endpoints.CORE}friend/pool/write/deactivate`;
      const result = await postRequest({ token, url, params: { savingPoolId }});
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return true;
    } catch (err) {
      console.log('Error deactivating pool: ', JSON.stringify(err));
      return false;
    }
  },

  async editSavingPoolDetails({ token, savingPoolId, propsToChange }) {
    try {
      const url = `${Endpoints.CORE}friend/pool/write/update`;
      const params = { savingPoolId, ...propsToChange };
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return true; // just edits properties, no need to do full update
    } catch (err) {
      console.log('Error editing details: ', JSON.stringify(err));
      return false;
    }
  },

  async removeSaveFromPool({ token, savingPoolId, transactionId }) {
    try {
      const url = `${Endpoints.CORE}friend/pool/write/retract`;
      const result = await postRequest({ token, url, params: { savingPoolId, transactionId }});
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      return result.json();
    } catch (err) {
      console.log('Error retracting save from pool: ', JSON.stringify(err));
    }
  },

  async removeFriendFromPool({ token, savingPoolId, friendshipId }) {
    try {
      const url = `${Endpoints.CORE}friend/pool/write/update`;
      const params = { savingPoolId, friendshipToRemove: friendshipId };
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      } 
      return true;
    } catch (err) {
      console.log('Error removing person from pool: ', JSON.stringify(err));
    }
  },

  async createFriendTournament({ token, params }) {
    try {
      const url = `${Endpoints.CORE}friend/tournament`;
      // console.log('Creating tournament, with params: ', params);
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      const resultBody = await result.json();
      if (resultBody.result !== 'SUCCESS') {
        console.log('Error creating friend boost, WTF: ', resultBody);
        return false;
      }
      return resultBody.createdBoost ? transformBoostToTournament(resultBody.createdBoost) : {};
    } catch (err) {
      console.log('Error creating boost tournamnet: ', JSON.stringify(err));
      return false;
    }
  },

  async fetchFriendTournaments(token) {
    try {
      const url = `${Endpoints.CORE}boost/list`;
      const params = { flag: 'FRIEND_TOURNAMENT', onlyActive: true };
      const result = await getRequest({ token, url, params });
      if (!result.ok) {
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      const rawBoosts = await result.json();
      // there can sometimes be a lag between boosts ending and statuses etc tying up (scheduled jobs etc), so
      // just filter on this here too
      return rawBoosts.filter((boost) => boost.active).map(transformBoostToTournament)
    } catch (err) {
      console.log('Error retrieving friend tournaments: ', err);
      return [];
    }
  },

  async fetchTournamentDetails(token, boostId) {
    try {
      const url = `${Endpoints.CORE}boost/detail`;
      const params = { boostId };
      // console.log('Submitting request');
      const result = await getRequest({ token, url, params });
      // console.log('Result raw: ', JSON.stringify(result));
      if (!result.ok) {
        // this one should not give any 400/404s etc., so would be a true error
        LoggingUtil.logApiError(url, result);
        throw result;
      }
      const boostDetails = await result.json();
      // console.log('Received from backend: ', boostDetails);
      return boostDetails;  
    } catch (err) {
      console.log('Error getting tournament: ', JSON.stringify(err));
      return null;
    }
  },

}
