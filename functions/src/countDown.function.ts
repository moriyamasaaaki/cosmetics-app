import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { markEventTried, shouldEventRun } from './utility.function';

const db = admin.firestore();


export const countDown = functions.firestore

  .document('items/{itemId}/likedUserIds/{userId}')
  .onDelete(async (snap, context) => {
    const eventId = context.eventId;
    return shouldEventRun(eventId).then(async (should: boolean) => {
      if (should) {
        await db
          .doc(`articles/${context.params.itemId}`)
          .update('liked', admin.firestore.FieldValue.increment(-1));
        return markEventTried(eventId);
      } else {
        return;
      }
    });
  });
