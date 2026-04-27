import Realm from 'realm';

export class Motorcycle extends Realm.Object<Motorcycle> {
  _id!: Realm.BSON.ObjectId;
  name!: string;
  model!: string;
  plateNumber!: string;
  currentOdoMeter!: number;
  image?: string;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Motorcycle',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new Realm.BSON.ObjectId() },
      name: 'string',
      model: 'string',
      plateNumber: 'string',
      currentOdoMeter: { type: 'int', default: 0 },
      image: { type: 'string', default: '', optional: true },
      createdAt: { type: 'date', default: () => new Date() },
      updatedAt: { type: 'date', default: () => new Date() },
    },
  };
}
