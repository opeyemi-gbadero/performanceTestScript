# Yohanna Performance Testing Script

This repository contains a performance testing script for the Yohanna application. The script is written in JavaScript and uses the [k6](https://k6.io/) performance testing tool to simulate user interactions with various endpoints of the Yohanna API.

## Features

The script tests the following endpoints:

1. **Authentication Endpoint**:
   - Signs in a user and retrieves an access token.

2. **Prayer Request Endpoint**:
   - Sends a prayer request and logs the corresponding events.

3. **Verse of the Day Endpoint**:
   - Retrieves the verse of the day and logs the corresponding events.

4. **Verse Sharing Endpoint**:
   - Simulates sharing a verse and logs the corresponding events.

5. **Mood Check-In Endpoint**:
   - Simulates mood check-ins with various emotions and logs the corresponding events.

6. **Narrative and Cross-Reference Endpoints**:
   - Retrieves narrative and cross-reference data for specific books, chapters, and verses.

7. **Calendar and Book Recap Endpoints**:
   - Retrieves weekly and monthly activity summaries.

8. **Praise Messages Endpoint**:
   - Sends praise messages and logs the responses.

9. **Grace Token Endpoint**:
   - Retrieves wallet information.

## Prerequisites

- Install [k6](https://k6.io/docs/getting-started/installation/) on your machine.
- Ensure you have access to the Yohanna API and valid credentials.

