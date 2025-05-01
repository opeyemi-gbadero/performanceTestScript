import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 1 }, // Ramp-up to 1 VU in 1 minute
  ],
};

/*export const options = {
  stages: [
    { duration: '2m', target: 10 },    // Ramp-up to 10 VUs in 2 minutes
    { duration: '10m', target: 10 },  // Stay at 10 VUs for 10 minutes
    { duration: '2m', target: 100 },  // Ramp-up to 100 VUs in 2 minutes
    { duration: '10m', target: 100 }, // Stay at 100 VUs for 10 minutes
    { duration: '2m', target: 1000 }, // Ramp-up to 1000 VUs in 2 minutes
    { duration: '30m', target: 1000 }, // Stay at 1000 VUs for 30 minutes
    { duration: '2m', target: 0 },    // Ramp-down to 0 VUs in 2 minutes
  ],
};*/

const api_url = 'https://api.staging.yohanna.org';
const BASE_URL = 'https://lambda.staging.yohanna.org';

export function setup() {
  const signinResponse = http.post(`${BASE_URL}/auth/signin`, JSON.stringify({
    email: 'real.osprog@gmail.com',
    password: 'Qwerty!123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(signinResponse, {
    'Signin status is 200': (r) => r.status === 200,
  });

  if (signinResponse.status !== 200) {
    throw new Error('Signin failed');
  }

  const responseBody = JSON.parse(signinResponse.body);
  const accessToken = responseBody.data.AccessToken;

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // Prayer Request Endpoint
  const prayerResponse = http.post(`${BASE_URL}/prayer/request`, JSON.stringify({
    prayerRequest: "Please pray for my family and friends.",
  }), authHeaders);

  console.log(`Prayer Request Response Status: ${prayerResponse.status}`);
  console.log(`Prayer Request Response Body: ${prayerResponse.body}`);

  check(prayerResponse, {
    'Prayer Request status is 200': (r) => r.status === 200,
  });

  // Prayer Request Event Endpoint
  const prayerEventResponse = http.post(`${api_url}/backend-service/events/`, JSON.stringify({
    type: "user.activity.prayer.request",
    timestamp: Date.now(),
    metadata: {},
  }), authHeaders);

  console.log(`Prayer Event Log Response Status: ${prayerEventResponse.status}`);
  console.log(`Prayer Event Log Response Body: ${prayerEventResponse.body}`);

  check(prayerEventResponse, {
    'Prayer Event Log status is 200': (r) => r.status === 200,
  });

  // Prayer Request Share Event Endpoint
  const prayerShareEventResponse = http.post(`${api_url}/backend-service/events/`, JSON.stringify({
    type: "share.user.activity.prayer.request",
    timestamp: Date.now(),
    metadata: {},
  }), authHeaders);

  console.log(`Prayer Share Event Log Response Status: ${prayerShareEventResponse.status}`);
  console.log(`Prayer Share Event Log Response Body: ${prayerShareEventResponse.body}`);

  check(prayerShareEventResponse, {
    'Prayer Share Event Log status is 200': (r) => r.status === 200,
  });

  return accessToken; // Pass the access token to the default function
}
  
export default function (accessToken) {
    const authHeaders = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
  
    const emotionsWithTexts = {
        Sad: "I need 80 words of comfort not to make me sad again as words less than 80 makes me cry tirelessly and still make me sad.",
        Lonely: "I feel lonely and need words of encouragement to uplift my spirit and make me feel connected again.",
        Joyful: "I am joyful and would love to share my happiness with words that inspire others to feel the same.",
        Frustrated: "I am frustrated and need calming words to help me regain my focus and composure.",
        Overwhelmed: "I feel overwhelmed and need words of reassurance to help me manage my emotions and tasks effectively.",
        Hopeful: "I am hopeful and would like words that strengthen my faith and keep me motivated.",
      };

      // Example ranges for book, chapter, and verse
    const books = [1, 2, 3]; // book numbers
    const chapters = [1, 2, 3]; // chapters numbers
    const verses = [1, 2, 3]; // verse numbers


    const batchRequests = [];
      
     // Testimonial  Endpoint
    batchRequests.push([
        'GET',
        `${api_url}/admin-service/testimonies/all`,
        null,
        authHeaders,
      ]);

  
    // Verse of the Day Endpoint
    batchRequests.push([
      'GET',
      `${BASE_URL}/verse-of-the-day/get-all?pageSize=6`,
      null
    ]);

    // Verse of the Day Event Endpoint
    batchRequests.push([
      'POST',
      `${api_url}/backend-service/events/`,
      JSON.stringify({
        type: "user.activity.daily.verse.read",
        timestamp: Date.now(),
        metadata: {},
      }),
      authHeaders,
    ]);
  
    // Verse Sharing Endpoint
    batchRequests.push([
      'GET',
      `${api_url}/uat-service/verses-read/?chapter=1&book=1`,
      null,
      authHeaders,
    ]);

    //verse sharing event endpoint
    batchRequests.push([
      'POST',
      `${api_url}/backend-service/events/`,
      JSON.stringify({
        type: "share.user.activity.verse.read",
        timestamp: Date.now(),
        metadata: {
          verse: 1,
          chapter: 1,
          book: 1
        },
      }),
      authHeaders,
    ]);
  
    // Mood Check-In Endpoint
     Object.entries(emotionsWithTexts).forEach(([emotion, text]) => {
    batchRequests.push([
      'POST',
      `${BASE_URL}/mood-checkin`,
      JSON.stringify({ emotion: emotion, text: text }),
      authHeaders,
    ]);
    });

    //mood check-in event endpoint
    batchRequests.push([
      'POST',
      `${api_url}/backend-service/events/`,
      JSON.stringify({
        type: "user.activity.emotion.mood.checkin",
        timestamp: Date.now(),
        metadata: {
         
        },
      }),
      authHeaders,
    ]);

    //mood check-in share event endpoint
    batchRequests.push([
        'POST',
        `${api_url}/backend-service/events/`,
        JSON.stringify({
          type: "share.user.activity.emotion.mood.checkin",
          timestamp: Date.now(),
          metadata: {
            
          },
        }),
        authHeaders,
      ]);


  
    

    //Narrative endpoint 
    books.forEach((book) => {
        chapters.forEach((chapter) => {
          verses.forEach((verse) => {
            console.log(`Adding request ${batchRequests.length + 1}: Narrative Endpoint for book=${book}, chapter=${chapter}, verse=${verse}`);
            batchRequests.push([
              'GET',
              `${api_url}/bible-service/narrations/lbcv/english/${book}/${chapter}/${verse}`,
              null,
              authHeaders,
            ]);
          });
        });
      });

    //Cross-reference endpoint
    books.forEach((book) => {
        chapters.forEach((chapter) => {
          verses.forEach((verse) => {
            console.log(`Adding request ${batchRequests.length + 1}: cross-referene Endpoint for book=${book}, chapter=${chapter}, verse=${verse}`);
            batchRequests.push([
              'GET',
              `${api_url}/bible-service/verses/c/kjv.${book}.${chapter}.${verse}`,
              null,
              authHeaders,
            ]);
          });
        });
      });

    //Calendar endpoint
    batchRequests.push([
      'GET',
      `${api_url}/uat-service/daily-activities/this-week`,
      null,
      authHeaders,
    ]);

    //Book Recap endpoint
    batchRequests.push([
        'GET',
        `${api_url}/uat-service/daily-activities/this-month`,
        null,
        authHeaders,
      ]);
      
    //Praise Messages Endpoint
    const threadId = "thread_Fuq3Qn5crVWJRk0i2YwBd5jT"; //generated from thread endpoint 
    const statements = [
        "Who wrote the first book of philosophy",
        "Why do women like money in politics and relationships?"
      ];
    // Iterate through each statement and send a POST request
    statements.forEach((statement) => {
        batchRequests.push([
          'POST',
          `${BASE_URL}/praises/messages/${threadId}`,
          JSON.stringify({ prompt: statement }),
          authHeaders,
        ]);
        sleep(20);
      });
    
    //grace token endpoint
    batchRequests.push([
        'GET',
        `${api_url}/gam-service/wallets/me`,
        null,
        authHeaders,
    ]);
    
      

    // Execute all requests in a batch
    const responses = http.batch(batchRequests);
  
    // Log and check the responses for each request
    responses.forEach((res, index) => {
      console.log(`Response ${index + 1} status: ${res.status}`);
      console.log(`Response ${index + 1} body: ${res.body}`);
  
      if (res.status !== 200) {
        console.error(`Request ${index + 1} failed with status: ${res.status}`);
        console.error(`Response body: ${res.body}`);
      }
  
      check(res, {
        [`Response ${index + 1} status is 200`]: (r) => r.status === 200,
      });
    });
  
    sleep(10);
  }
