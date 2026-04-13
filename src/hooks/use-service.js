// src/hooks/use-service.js
import {useQuery, useRealm} from '@realm/react';
import {useCallback} from 'react';
import Realm from 'realm';
import {Service} from '../models/service';

// ─── Validation Helpers ──────────────────────────────────────────────

function validateRequiredString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

function validateServiceData(data) {
  const errors = [];

  const typeErr = validateRequiredString(data?.serviceType, 'Service type');
  if (typeErr) {
    errors.push(typeErr);
  }

  if (!data?.motorcycleId) {
    errors.push('Motorcycle ID is required');
  }

  if (!data?.serviceDate || !(data.serviceDate instanceof Date)) {
    errors.push('Service date is required');
  }

  if (
    data?.odometerAtService !== undefined &&
    (typeof data.odometerAtService !== 'number' || data.odometerAtService < 0)
  ) {
    errors.push('Odometer must be a non-negative number');
  }

  if (
    data?.cost !== undefined &&
    (typeof data.cost !== 'number' || data.cost < 0)
  ) {
    errors.push('Cost must be a non-negative number');
  }

  return {valid: errors.length === 0, errors};
}

// ─── Hook ────────────────────────────────────────────────────────────

/**
 * Custom hook for Service CRUD operations using Realm.
 *
 * @returns {{
 *   services: Realm.Results<Service>,
 *   getServicesByMotorcycle: (motorcycleId: Realm.BSON.ObjectId) => Realm.Results<Service>,
 *   createService: (data: Object) => { success: boolean, id?: Realm.BSON.ObjectId, error?: string },
 *   updateService: (id: Realm.BSON.ObjectId, updates: Object) => { success: boolean, error?: string },
 *   deleteService: (id: Realm.BSON.ObjectId) => { success: boolean, error?: string },
 *   serviceCount: number,
 * }}
 */
export function useService() {
  const realm = useRealm();

  // ─── READ ─────────────────────────────────────────────────────────
  const services = useQuery(Service, collection =>
    collection.sorted('serviceDate', true),
  );

  const serviceCount = services.length;

  /**
   * Get services filtered by motorcycle ID.
   * @param {Realm.BSON.ObjectId} motorcycleId
   * @returns {Realm.Results<Service>}
   */
  const getServicesByMotorcycle = useCallback(
    motorcycleId => {
      return realm
        .objects(Service)
        .filtered('motorcycleId == $0', motorcycleId)
        .sorted('serviceDate', true);
    },
    [realm],
  );

  // ─── CREATE ───────────────────────────────────────────────────────
  /**
   * Create a new service record.
   *
   * @param {Object} data
   * @param {Realm.BSON.ObjectId} data.motorcycleId - Associated motorcycle ID
   * @param {string} data.serviceType - Type of service
   * @param {Date} data.serviceDate - Date of service
   * @param {number} data.odometerAtService - Odometer at service time (KM)
   * @param {number} data.cost - Cost in IDR
   * @param {string} [data.workshop] - Workshop/mechanic name
   * @param {string} [data.notes] - Additional notes
   * @returns {{ success: boolean, id?: Realm.BSON.ObjectId, error?: string }}
   */
  const createService = useCallback(
    (data = {}) => {
      const validation = validateServiceData(data);
      if (!validation.valid) {
        return {success: false, error: validation.errors.join(', ')};
      }

      try {
        const id = new Realm.BSON.ObjectId();

        realm.write(() => {
          realm.create(Service, {
            _id: id,
            motorcycleId: data.motorcycleId,
            serviceType: data.serviceType.trim(),
            serviceDate: data.serviceDate,
            odometerAtService: Math.floor(data.odometerAtService || 0),
            cost: Math.floor(data.cost || 0),
            workshop: data.workshop?.trim() || '',
            notes: data.notes?.trim() || '',
            items: data.items ? JSON.stringify(data.items) : '[]',
            receiptPhotos: data.receiptPhotos || [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });

        return {success: true, id};
      } catch (error) {
        console.error('[useService] createService failed:', error);
        return {success: false, error: error.message};
      }
    },
    [realm],
  );

  // ─── UPDATE ───────────────────────────────────────────────────────
  const updateService = useCallback(
    (serviceId, updates = {}) => {
      if (!serviceId) {
        return {success: false, error: 'Service ID is required'};
      }

      try {
        realm.write(() => {
          const service = realm.objectForPrimaryKey(Service, serviceId);
          if (!service) {
            throw new Error(`Service not found: ${serviceId}`);
          }

          const readOnlyFields = ['_id', 'createdAt'];
          Object.keys(updates).forEach(key => {
            if (!readOnlyFields.includes(key)) {
              service[key] = updates[key];
            }
          });
          service.updatedAt = new Date();
        });

        return {success: true};
      } catch (error) {
        console.error('[useService] updateService failed:', error);
        return {success: false, error: error.message};
      }
    },
    [realm],
  );

  // ─── DELETE ───────────────────────────────────────────────────────
  const deleteService = useCallback(
    serviceId => {
      if (!serviceId) {
        return {success: false, error: 'Service ID is required'};
      }

      try {
        realm.write(() => {
          const service = realm.objectForPrimaryKey(Service, serviceId);
          if (!service) {
            throw new Error(`Service not found: ${serviceId}`);
          }
          realm.delete(service);
        });

        return {success: true};
      } catch (error) {
        console.error('[useService] deleteService failed:', error);
        return {success: false, error: error.message};
      }
    },
    [realm],
  );

  return {
    services,
    serviceCount,
    getServicesByMotorcycle,
    createService,
    updateService,
    deleteService,
  };
}
