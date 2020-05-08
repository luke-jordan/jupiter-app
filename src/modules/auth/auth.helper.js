// at some point, into a service, but dep injection, service connections etc., more pain than worth, for now
export const getRequest = async ({ token, url, params }) => {
  const urlString = `${url}?${new URLSearchParams(params).toString()}`
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'GET',
  };

  return fetch(urlString, options);
};

export const postRequest = async ({ token, url, params }) => {
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(params),
  };

  return fetch(url, options);
}
