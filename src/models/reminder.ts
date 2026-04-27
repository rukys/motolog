import Realm from 'realm';

export type ReminderType = 'TIME' | 'DISTANCE' | 'ODO_CHECK' | 'AI_SUGGESTION';
export type ReminderStatus = 'PENDING' | 'TRIGGERED' | 'COMPLETED';

export class Reminder extends Realm.Object<Reminder> {
  _id!: Realm.BSON.ObjectId;
  motorcycleId!: Realm.BSON.ObjectId;
  type!: ReminderType;
  title!: string;
  body!: string;
  expectedValue?: number;
  expectedDate?: Date;
  status!: ReminderStatus;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Reminder',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new Realm.BSON.ObjectId() },
      motorcycleId: 'objectId',
      type: 'string',
      title: 'string',
      body: 'string',
      expectedValue: 'int?',
      expectedDate: 'date?',
      status: { type: 'string', default: 'PENDING' },
      createdAt: { type: 'date', default: () => new Date() },
      updatedAt: { type: 'date', default: () => new Date() },
    },
  };
}
