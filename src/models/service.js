import Realm from 'realm';

/**
 * Realm schema for Service entity.
 *
 * Represents a service/maintenance record for a motorcycle.
 *
 * @property {Realm.BSON.ObjectId} _id - Auto-generated primary key
 * @property {Realm.BSON.ObjectId} motorcycleId - Reference to the Motorcycle
 * @property {string} serviceType - Type of service (e.g., "Oil Change", "Tire Replacement")
 * @property {Date} serviceDate - Date when the service was performed
 * @property {number} odometerAtService - Odometer reading at time of service (KM)
 * @property {number} cost - Total cost of the service (IDR)
 * @property {string} workshop - Name of the workshop/mechanic
 * @property {string} notes - Additional notes about the service
 * @property {string} items - JSON string of service items [{type, description, price}]
 * @property {string[]} receiptPhotos - List of local file paths for receipt photos
 * @property {Date} createdAt - Auto-generated timestamp on creation
 * @property {Date} updatedAt - Auto-updated timestamp on modification
 */
export class Service extends Realm.Object {
  static schema = {
    name: 'Service',
    primaryKey: '_id',
    properties: {
      _id: {type: 'objectId', default: () => new Realm.BSON.ObjectId()},
      motorcycleId: {type: 'objectId'},
      serviceType: {type: 'string'},
      serviceDate: {type: 'date'},
      odometerAtService: {type: 'int', default: 0},
      cost: {type: 'int', default: 0},
      workshop: {type: 'string', default: '', optional: true},
      notes: {type: 'string', default: '', optional: true},
      items: {type: 'string', default: '[]', optional: true},
      receiptPhotos: {type: 'list', objectType: 'string'},
      createdAt: {type: 'date', default: () => new Date()},
      updatedAt: {type: 'date', default: () => new Date()},
    },
  };
}
