import { useQuery, useRealm } from '@realm/react';
import { useCallback } from 'react';
import Realm from 'realm';
import { Motorcycle } from '../models/motorcycle';

// --- Types ---
export interface MotorcycleInput {
  name: string;
  model: string;
  plateNumber: string;
  currentOdoMeter: number;
  image?: string;
}

export interface MutationResult {
  success: boolean;
  id?: Realm.BSON.ObjectId;
  error?: string;
}

// --- Validation Helpers ---
function validateRequiredString(value: any, fieldName: string): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return `${fieldName} is required and must be a non-empty string`;
  }
  return null;
}

function validateOdometer(value: any): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Odometer must be a valid number';
  }
  if (value < 0) {
    return 'Odometer cannot be negative';
  }
  return null;
}

function validateMotorcycleData(data: Partial<MotorcycleInput>) {
  const errors: string[] = [];

  const nameErr = validateRequiredString(data?.name, 'Name');
  if (nameErr) {errors.push(nameErr);}

  const modelErr = validateRequiredString(data?.model, 'Model');
  if (modelErr) {errors.push(modelErr);}

  const plateErr = validateRequiredString(data?.plateNumber, 'Plate number');
  if (plateErr) {errors.push(plateErr);}

  const odoErr = validateOdometer(data?.currentOdoMeter);
  if (odoErr) {errors.push(odoErr);}

  return { valid: errors.length === 0, errors };
}

// --- Hook ---
export function useMotorcycle() {
  const realm = useRealm();

  const motorcycles = useQuery(Motorcycle, (collection) =>
    collection.sorted('createdAt', true)
  );

  const motorcycleCount = motorcycles.length;

  const createMotorcycle = useCallback(
    (data: MotorcycleInput): MutationResult => {
      const validation = validateMotorcycleData(data);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      try {
        const id = new Realm.BSON.ObjectId();
        realm.write(() => {
          realm.create(Motorcycle, {
            _id: id,
            name: data.name.trim(),
            model: data.model.trim(),
            plateNumber: data.plateNumber.trim().toUpperCase(),
            currentOdoMeter: Math.floor(data.currentOdoMeter),
            image: data.image || '',
            createdAt: new Date(),
          });
        });
        return { success: true, id };
      } catch (error: unknown) {
        const err = error as Error;
        if (__DEV__) {
          console.error('[useMotorcycle] createMotorcycle failed:', err);
        }
        return { success: false, error: err.message };
      }
    },
    [realm]
  );

  const updateMotorcycle = useCallback(
    (motorcycleId: Realm.BSON.ObjectId, updates: Partial<MotorcycleInput>): MutationResult => {
      if (!motorcycleId) {
        return { success: false, error: 'Motorcycle ID is required' };
      }

      try {
        realm.write(() => {
          const motorcycle = realm.objectForPrimaryKey(Motorcycle, motorcycleId);
          if (!motorcycle) {
            throw new Error(`Motorcycle not found: ${motorcycleId}`);
          }

          Object.keys(updates).forEach((key) => {
            const typedKey = key as keyof MotorcycleInput;
            let value = updates[typedKey];

            if (typedKey === 'name' || typedKey === 'model' || typedKey === 'plateNumber') {
              if (typeof value === 'string') {
                value = value.trim();
                if (typedKey === 'plateNumber') {value = value.toUpperCase();}
              }
            } else if (typedKey === 'currentOdoMeter' && typeof value === 'number') {
              value = Math.floor(value);
            }

            if (value !== undefined) {
              (motorcycle as any)[typedKey] = value;
            }
          });
        });
        return { success: true };
      } catch (error: unknown) {
        const err = error as Error;
        if (__DEV__) {
          console.error('[useMotorcycle] updateMotorcycle failed:', err);
        }
        return { success: false, error: err.message };
      }
    },
    [realm]
  );

  const updateOdometer = useCallback(
    (motorcycleId: Realm.BSON.ObjectId, newOdoMeter: number): MutationResult => {
      return updateMotorcycle(motorcycleId, { currentOdoMeter: newOdoMeter });
    },
    [updateMotorcycle]
  );

  const deleteMotorcycle = useCallback(
    (motorcycleId: Realm.BSON.ObjectId): MutationResult => {
      try {
        realm.write(() => {
          const motorcycle = realm.objectForPrimaryKey(Motorcycle, motorcycleId);
          if (motorcycle) {realm.delete(motorcycle);}
        });
        return { success: true };
      } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message };
      }
    },
    [realm]
  );

  const getMotorcycleById = useCallback(
    (motorcycleId: Realm.BSON.ObjectId | string): Motorcycle | null => {
      const id = typeof motorcycleId === 'string' ? new Realm.BSON.ObjectId(motorcycleId) : motorcycleId;
      return realm.objectForPrimaryKey(Motorcycle, id) ?? null;
    },
    [realm]
  );

  return {
    motorcycles,
    motorcycleCount,
    createMotorcycle,
    updateMotorcycle,
    updateOdometer,
    deleteMotorcycle,
    getMotorcycleById,
  };
}
