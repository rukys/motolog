import Realm from 'realm';

export class Reminder extends Realm.Object {
  static schema = {
    name: 'Reminder',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new Realm.BSON.ObjectId() },
      motorcycleId: 'objectId', // Link to the motorcycle
      type: 'string', // 'TIME' | 'DISTANCE' | 'ODO_CHECK' | 'AI_SUGGESTION'
      title: 'string',
      body: 'string',
      expectedValue: 'int?', // Number, e.g. KM for distance-based
      expectedDate: 'date?', // Date for time-based
      status: { type: 'string', default: 'PENDING' }, // 'PENDING' | 'TRIGGERED' | 'COMPLETED'
      createdAt: { type: 'date', default: () => new Date() },
      updatedAt: { type: 'date', default: () => new Date() },
    },
  };
}
