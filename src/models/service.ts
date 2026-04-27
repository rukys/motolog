import Realm from 'realm';

export class Service extends Realm.Object<Service> {
  _id!: Realm.BSON.ObjectId;
  motorcycleId!: Realm.BSON.ObjectId;
  serviceType!: string;
  serviceDate!: Date;
  odometerAtService!: number;
  cost!: number;
  workshop?: string;
  notes?: string;
  items?: string; // JSON string of service items
  receiptPhotos!: Realm.List<string>;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Service',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new Realm.BSON.ObjectId() },
      motorcycleId: 'objectId',
      serviceType: 'string',
      serviceDate: 'date',
      odometerAtService: { type: 'int', default: 0 },
      cost: { type: 'int', default: 0 },
      workshop: { type: 'string', default: '', optional: true },
      notes: { type: 'string', default: '', optional: true },
      items: { type: 'string', default: '[]', optional: true },
      receiptPhotos: { type: 'list', objectType: 'string' },
      createdAt: { type: 'date', default: () => new Date() },
      updatedAt: { type: 'date', default: () => new Date() },
    },
  };
}
