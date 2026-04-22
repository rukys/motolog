import { useQuery, useRealm } from '@realm/react';
import { Reminder } from '../models/reminder';
import Realm from 'realm';

export const useReminder = () => {
  const realm = useRealm();
  // Sort reminders by expectedDate ascending, or fallback to createdAt
  const reminders = useQuery(Reminder).sorted('expectedDate', false);

  const addReminder = (motorcycleId, type, title, body, expectedValue = null, expectedDate = null) => {
    realm.write(() => {
      realm.create('Reminder', {
        _id: new Realm.BSON.ObjectId(),
        motorcycleId,
        type,
        title,
        body,
        expectedValue,
        expectedDate,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  };

  const markAsTriggered = (reminderId) => {
    const reminder = realm.objectForPrimaryKey('Reminder', new Realm.BSON.ObjectId(reminderId));
    if (reminder) {
      realm.write(() => {
        reminder.status = 'TRIGGERED';
        reminder.updatedAt = new Date();
      });
    }
  };

  const markAsCompleted = (reminderId) => {
    const reminder = realm.objectForPrimaryKey('Reminder', new Realm.BSON.ObjectId(reminderId));
    if (reminder) {
      realm.write(() => {
        reminder.status = 'COMPLETED';
        reminder.updatedAt = new Date();
      });
    }
  };

  return { reminders, addReminder, markAsTriggered, markAsCompleted };
};
