import Expo from 'expo';
import { Platform } from 'react-native';

let isReloading = false;
export async function reloadIfUpdateAvailable () {
  const {id,sdkVersion,revisionId} = Expo.Constants.manifest;
  if (!revisionId) return;

  const res = await fetch(`https://expo.io/${id}/index.exp`, {
    headers: {
    'Exponent-SDK-Version': sdkVersion,
    'Exponent-Platform': Platform.OS,
    },
    method: 'GET',
  });

  const json = await res.json();
  if (!json.revisionId) return;

  if (json.sdkVersion === sdkVersion) {
    if (json.revisionId !== revisionId) {
      if (!isReloading) {
        isReloading = true;
        Expo.Util.reload();
      }
    }
  }

}
