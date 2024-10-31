import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
    type: "service_account",
    project_id: "hotel-management-db2db",
    private_key_id: "d9de90debb6ac51dbed6a98cc5d5956b5245c1df",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZ8W/3xUHfApd+\nxT8ObB/PIq0Dfvju7i7lHjSq6KBwC3/mtpAxpo2DAKjHrM22kRu18hchAaGoBoi6\n+aNFib6Q66V3/W2n5iVx/uoNQwDeJONYKqrP+Dhb43pq8vidhYIyfK0EK3TzbsYR\nooN85IypGN/awkh4jTyuAtsKnZ6/5n6a1eT9bkMo55gWoMO/dE2SJ8u3s9YH11nD\nCv4I+BgahD8oLSMkAJj2zM9lGSLV393NBWhajkUBJID1ujWFqIhakHYPQjlDGmiV\nmXTqxCbOV5o0DbweCsFyYf+F7qZNKaJcJ8T20vxgpU/HesOXHHbZWkkcsoZ0dqar\nlHln9t4JAgMBAAECgf9IXOHQYq58XV/vt444O65UGC9Z+c6thmgLqvvRw2uByE+v\nSu6Vjbdux8lCgx3KgGOzBa6oRuJl58V+T2TmsdWUSKmoLX07Qi8sqncL8DNZjuXt\nYD1W0BPmbqE24XWq16ljGgJYYBV0vlMFh/Agh8IsYxXwjJGDdWGwZUJVRABxtnll\ncpcm18DChs+ecIGLvKNQk9zDwZBqXWqo2PNnyRtfgyB2145Wi31Jumn+nEKiu825\nZLY2Ww6rjknTx2pUhI9VKdLccYDtRi70+ZJ18dLeo+7qWmW/Qv77koAFF31Qj8Yq\nC6A0rqmhLpZD6vnC+jyNdZLqDLFGNLyRY6cgmZUCgYEA83fO+RfRFVaISV7hgRQw\noenxlHiu0M4KCVGRxHAktWVUxioC4R5d4ulrKfY8HIIepML/ZyLhVxWuIyz8cHMi\nJTIvXrDTxfGaV6P8N2A/nyHAqDv3SOQhUYIRhC57ztKXsHEpZNIMZ4fNK6p+NhkQ\nlRpv2Y3k+RDJBuGPIvqaRfsCgYEA5SlJOGXQqoA2b2iv00ck/9S9NjciJdagpLLv\n23h9g1v6xFufp+EwyKBNdhRv1WXX/m/UgOYnmYM3PoNEkYsyY5uo5xteSwzmIlGD\njYv5IdVbTajrV9GG0pdC+xBlQq2duYUjJinfEmbdgySAWD7wyA4jR0enlXMK9Myn\nTtkGIMsCgYEA8ThvFFUIjv+hIDCldGIwnPtQoy2+5pp9TyZGKj6B4Ed5aq0NFUYk\n90EVMAoLHKO/ALdCnUjtwn50fd2Ab1ljJz9Ft6ey6pept9N9fNAbuOqUGxrusoV0\njXE1MaVsfUohiGtV+9IxABKIsQ7G5YqH53K+BuqTRkHfKrYoPxvT5ikCgYEA27E5\n9ex+IIcsKKB3N5jUGsNr5gbzIM1jUqINGx2nToCmpwqjxAE6kIxF1rb/A9lQOigh\n1LVRL3XBR5f264VD+IRpZ64wNskV876r3M5dOBdgIdKYVKeVllzXJPRx73ucYxgF\nO3gW2IBvSmN6+57TnScYoSRLwBX7Yfa1Svz6SAMCgYEA2QTc7SC1LCDZ7gT4Swuw\nYWwdOLaUN1bn6n7ECpP902HwtDgd3TcBY/CfX3/tWXd46uHKt2sWTodldxUEgsGK\nZ0sS3G/w7vaDcHNDGmdNm/DK8O+s6FoXU/kAPQDnZER5wtj75mg0ZZqHTTNMN6FK\nPzXS6SUX13yFBhL5JUvV6Nc=\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-9ayy6@hotel-management-db2db.iam.gserviceaccount.com",
    client_id: "104411742536747909287",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-9ayy6%40hotel-management-db2db.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  };

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: 'hotel-management-db2db.appspot.com'
});

const bucket = admin.storage().bucket();
export default bucket;

