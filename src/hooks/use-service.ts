import { useQuery, useRealm } from '@realm/react';
import { useCallback } from 'react';
import Realm from 'realm';
import { Service } from '../models/service';
import { MutationResult } from './use-motorcycle';

export interface ServiceInput {
  motorcycleId: Realm.BSON.ObjectId;
  serviceType: string;
  serviceDate: Date;
  odometerAtService: number;
  cost: number;
  workshop?: string;
  notes?: string;
  items?: string;
  receiptPhotos?: string[];
}

export function useService(motorcycleId?: Realm.BSON.ObjectId) {
  const realm = useRealm();

  const services = useQuery(
    Service,
    (collection) => {
      let filtered = collection;
      if (motorcycleId) {
        filtered = filtered.filtered('motorcycleId == $0', motorcycleId);
      }
      return filtered.sorted('serviceDate', true);
    },
    [motorcycleId]
  );

  const createService = useCallback(
    (data: ServiceInput): MutationResult => {
      try {
        const id = new Realm.BSON.ObjectId();
        realm.write(() => {
          realm.create(Service, {
            ...data,
            _id: id,
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

  const deleteService = useCallback(
    (serviceId: Realm.BSON.ObjectId): MutationResult => {
      try {
        realm.write(() => {
          const service = realm.objectForPrimaryKey(Service, serviceId);
          if (service) {realm.delete(service);}
        });
        return { success: true };
      } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message };
      }
    },
    [realm]
  );

  const getServicesByMotorcycle = useCallback(
    (mId: Realm.BSON.ObjectId) => {
      return realm.objects(Service).filtered('motorcycleId == $0', mId).sorted('serviceDate', true);
    },
    [realm]
  );

  return {
    services,
    serviceCount: services.length,
    createService,
    deleteService,
    getServicesByMotorcycle,
  };
}
