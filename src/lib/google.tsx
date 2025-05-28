import { loadGapiInsideDOM } from 'gapi-script';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY   = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export async function initGapi() {
  await loadGapiInsideDOM();
  return new Promise<void>((resolve) => {
    gapi.load('client:auth2', async () => {
      await gapi.client.init({ apiKey: API_KEY, clientId: CLIENT_ID, discoveryDocs: DISCOVERY_DOCS, scope: SCOPES });
      resolve();
    });
  });
}

export function signIn() {
  return gapi.auth2.getAuthInstance().signIn();
}
