import Realm from 'realm';

/**
 * Realm schema for Motorcycle entity.
 *
 * Represents a motorcycle in the user's garage with essential
 * identification and tracking properties.
 *
 * @property {Realm.BSON.ObjectId} _id - Auto-generated primary key
 * @property {string} name - User-defined nickname (e.g., "My Yamaha")
 * @property {string} model - Motorcycle model/type (e.g., "Yamaha YZF-R1")
 * @property {string} plateNumber - License plate number (e.g., "B 1234 XYZ")
 * @property {number} currentOdoMeter - Current odometer reading in KM
 * @property {string} image - Optional image path or URI for motorcycle photo
 * @property {Date} createdAt - Auto-generated timestamp on creation
 * @property {Date} updatedAt - Auto-updated timestamp on modification
 */
export class Motorcycle extends Realm.Object {
  static schema = {
    name: 'Motorcycle',
    primaryKey: '_id',
    properties: {
      _id: {type: 'objectId', default: () => new Realm.BSON.ObjectId()},
      name: {type: 'string'},
      model: {type: 'string'},
      plateNumber: {type: 'string'},
      currentOdoMeter: {type: 'int', default: 0},
      image: {type: 'string', default: '', optional: true},
      createdAt: {type: 'date', default: () => new Date()},
      updatedAt: {type: 'date', default: () => new Date()},
    },
  };
}
