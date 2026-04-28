import { useQuery, useRealm } from '@realm/react';
import { useCallback } from 'react';
import Realm from 'realm';
import { Reminder, ReminderType, ReminderStatus } from '../models/reminder';
import { MutationResult } from './use-motorcycle';

export interface ReminderInput {
  motorcycleId: Realm.BSON.ObjectId;
  type: ReminderType;
  title: string;
  body: string;
  expectedValue?: number;
  expectedDate?: Date;
  status?: ReminderStatus;
}

export function useReminder(motorcycleId?: Realm.BSON.ObjectId) {
  const realm = useRealm();

  const reminders = useQuery(
    Reminder,
    (collection) => {
      let filtered = collection;
      if (motorcycleId) {
        filtered = filtered.filtered('motorcycleId == $0', motorcycleId);
      }
      return filtered.sorted('createdAt', true);
    },
    [motorcycleId]
  );

  const createReminder = useCallback(
    (data: ReminderInput): MutationResult => {
      try {
        const id = new Realm.BSON.ObjectId();
        realm.write(() => {
          realm.create(Reminder, {
            ...data,
            _id: id,
            status: data.status || 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
        return { success: true, id };
      } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message };
      }
    },
    [realm]
  );

  const updateReminderStatus = useCallback(
    (reminderId: Realm.BSON.ObjectId, status: ReminderStatus): MutationResult => {
      try {
        realm.write(() => {
          const reminder = realm.objectForPrimaryKey(Reminder, reminderId);
          if (reminder) {
            reminder.status = status;
            reminder.updatedAt = new Date();
          }
        });
        return { success: true };
      } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message };
      }
    },
    [realm]
  );

  const deleteReminder = useCallback(
    (reminderId: Realm.BSON.ObjectId): MutationResult => {
      try {
        realm.write(() => {
          const reminder = realm.objectForPrimaryKey(Reminder, reminderId);
          if (reminder) {realm.delete(reminder);}
        });
        return { success: true };
      } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message };
      }
    },
    [realm]
  );

  const markAsCompleted = useCallback(
    (reminderId: string | Realm.BSON.ObjectId): MutationResult => {
      const id = typeof reminderId === 'string' ? new Realm.BSON.ObjectId(reminderId) : reminderId;
      return updateReminderStatus(id, 'COMPLETED');
    },
    [updateReminderStatus]
  );

  return {
    reminders,
    createReminder,
    updateReminderStatus,
    markAsCompleted,
    deleteReminder,
  };
}
