import { Endpoints } from '../../util/Values';
import { getRequest, postRequest } from '../auth/auth.helper';

export const friendService = {

  async fetchFriendList(token) {
    try {
      const url = `${Endpoints.CORE}friend/list`;
      const result = await getRequest({ token, url });
      if (!result.ok) {
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
      const params = { requestId, acceptedShareItems: sharingLevel };
      console.log('Sending: ', params);
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
        throw result;
      }
      return true; // todo : return the new friendship
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
        throw result;
      }
      return true;
    } catch (err) {
      console.log('Error ignoring friend request: ', JSON.stringify(err));
      return false;
    }
  },

  // will need to think through this carefully
  async requestFriendToJoinBoost({ token, boostId, friendshipId }) {
    try {
      const url = `${Endpoints.CORE}friend/boost/add`;
      const params = { boostId, friendshipId };
      const result = await postRequest({ token, boostId, friendshipId });
    } catch (err) {
      console.log('Error inviting friend to boost: ', JSON.stringify(err));
    }
  },

  async deactivateFriendship(token, friendshipId) {
    try {
      const url = `${Endpoints.CORE}friend/deactivate`;
      const params = { relationshipId: friendshipId };
      const result = await postRequest({ token, url, params });
      if (!result.ok) {
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
        throw result;
      }
      return true;
    } catch (err) {
      console.log('Error cancelling request: ', JSON.stringify(err));
      return false;
    }
  },

}