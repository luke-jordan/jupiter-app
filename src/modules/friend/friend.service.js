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

  async initiateFriendRequest({ token, targetContactDetails, sharingLevel, sharingMessage }) {
    try {
      const url = `${Endpoints.CORE}friend/request/initiate`;
      const params = { targetContactDetails, sharingLevel, sharingMessage };
      const result = await postRequest({ token, url, params });
    } catch (err) {
      console.log('Error posting friend request: ', JSON.stringify(err));
    }
  },

  async respondToFriendRequest({ token, response, requestId, sharingLevel }) {
    try {
      const url = `${Endpoints.CORE}friend/request/respond`;
      const params = { requestId, response, sharingLevel };
      const result = await postRequest({ token, url, params });
    } catch (err) {
      console.log('Error accepting friend request: ', JSON.stringify(err));
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

}