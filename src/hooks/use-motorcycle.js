// src/hooks/use-motorcycle.js
import {useQuery, useRealm} from '@realm/react';
import {useCallback} from 'react';
import Realm from 'realm';
import {Motorcycle} from '../models/motorcycle';

// ─── Validation Helpers ──────────────────────────────────────────────

/**
 * Validates required string field.
 * @param {*} value - Value to validate
 * @param {string} fieldName - Human-readable field name for error message
 * @returns {string|null} Error message or null if valid
 */
function validateRequiredString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    return `${fieldName} is required and must be a non-empty string`;
  }
  return null;
}

/**
 * Validates odometer value.
 * @param {*} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
function validateOdometer(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Odometer must be a valid number';
  }
  if (value < 0) {
    return 'Odometer cannot be negative';
  }
  return null;
}

/**
 * Validates all fields required for creating a motorcycle.
 * @param {Object} data - Motorcycle data to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateMotorcycleData(data) {
  const errors = [];

  const nameErr = validateRequiredString(data?.name, 'Name');
  if (nameErr) {
    errors.push(nameErr);
  }

  const modelErr = validateRequiredString(data?.model, 'Model');
  if (modelErr) {
    errors.push(modelErr);
  }

  const plateErr = validateRequiredString(data?.plateNumber, 'Plate number');
  if (plateErr) {
    errors.push(plateErr);
  }

  const odoErr = validateOdometer(data?.currentOdoMeter);
  if (odoErr) {
    errors.push(odoErr);
  }

  return {valid: errors.length === 0, errors};
}

// ─── Hook ────────────────────────────────────────────────────────────

/**
 * Custom hook for Motorcycle CRUD operations using Realm.
 *
 * Provides reactive data query and safe mutation functions
 * with built-in validation and error handling.
 *
 * @returns {{
 *   motorcycles: Realm.Results<Motorcycle>,
 *   createMotorcycle: (data: Object) => { success: boolean, id?: Realm.BSON.ObjectId, error?: string },
 *   updateMotorcycle: (id: Realm.BSON.ObjectId, updates: Object) => { success: boolean, error?: string },
 *   updateOdometer: (id: Realm.BSON.ObjectId, newOdoMeter: number) => { success: boolean, error?: string },
 *   deleteMotorcycle: (id: Realm.BSON.ObjectId) => { success: boolean, error?: string },
 *   deleteAllMotorcycles: () => { success: boolean, error?: string },
 *   getMotorcycleById: (id: Realm.BSON.ObjectId) => Motorcycle | null,
 *   motorcycleCount: number,
 * }}
 *
 * @example
 * const { motorcycles, createMotorcycle, deleteMotorcycle } = useMotorcycle();
 *
 * const result = createMotorcycle({
 *   name: 'My Honda',
 *   model: 'Honda Beat',
 *   plateNumber: 'B 1234 XYZ',
 *   currentOdoMeter: 15000,
 * });
 *
 * if (!result.success) {
 *   Alert.alert('Error', result.error);
 * }
 */
export function useMotorcycle() {
  const realm = useRealm();

  // ─── READ ─────────────────────────────────────────────────────────
  // Reactive query — auto re-renders when data changes
  const motorcycles = useQuery(Motorcycle, collection =>
    collection.sorted('createdAt', true),
  );

  const motorcycleCount = motorcycles.length;

  // ─── CREATE ───────────────────────────────────────────────────────
  /**
   * Create a new motorcycle entry.
   *
   * @param {Object} data
   * @param {string} data.name - Motorcycle nickname (e.g., "My Yamaha")
   * @param {string} data.model - Motorcycle model (e.g., "Yamaha YZF-R1")
   * @param {string} data.plateNumber - License plate number (e.g., "B 1234 XYZ")
   * @param {number} data.currentOdoMeter - Current odometer reading in KM
   * @returns {{ success: boolean, id?: Realm.BSON.ObjectId, error?: string }}
   */
  const createMotorcycle = useCallback(
    (data = {}) => {
      // Validate input
      const validation = validateMotorcycleData(data);
      if (!validation.valid) {
        return {success: false, error: validation.errors.join(', ')};
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

        return {success: true, id};
      } catch (error) {
        console.error('[useMotorcycle] createMotorcycle failed:', error);
        return {success: false, error: error.message};
      }
    },
    [realm],
  );

  // ─── UPDATE ───────────────────────────────────────────────────────
  /**
   * Update one or more fields of an existing motorcycle.
   * Protected fields (_id, createdAt) cannot be modified.
   *
   * @param {Realm.BSON.ObjectId} motorcycleId - The motorcycle's primary key
   * @param {Object} updates - Key-value pairs of fields to update
   * @returns {{ success: boolean, error?: string }}
   */
  const updateMotorcycle = useCallback(
    (motorcycleId, updates = {}) => {
      if (!motorcycleId) {
        return {success: false, error: 'Motorcycle ID is required'};
      }

      if (Object.keys(updates).length === 0) {
        return {success: false, error: 'No updates provided'};
      }

      // Validate individual fields if present
      if (updates.name !== undefined) {
        const err = validateRequiredString(updates.name, 'Name');
        if (err) {
          return {success: false, error: err};
        }
      }
      if (updates.model !== undefined) {
        const err = validateRequiredString(updates.model, 'Model');
        if (err) {
          return {success: false, error: err};
        }
      }
      if (updates.plateNumber !== undefined) {
        const err = validateRequiredString(updates.plateNumber, 'Plate number');
        if (err) {
          return {success: false, error: err};
        }
      }
      if (updates.currentOdoMeter !== undefined) {
        const err = validateOdometer(updates.currentOdoMeter);
        if (err) {
          return {success: false, error: err};
        }
      }

      try {
        realm.write(() => {
          const motorcycle = realm.objectForPrimaryKey(
            Motorcycle,
            motorcycleId,
          );
          if (!motorcycle) {
            throw new Error(`Motorcycle not found: ${motorcycleId}`);
          }

          // Protect read-only fields
          const readOnlyFields = ['_id', 'createdAt'];
          const allowedUpdates = Object.keys(updates).filter(
            key => !readOnlyFields.includes(key),
          );

          // Sanitize and apply updates
          allowedUpdates.forEach(key => {
            let value = updates[key];

            // Sanitize string fields
            if (typeof value === 'string') {
              value = value.trim();
            }
            // Uppercase plate number
            if (key === 'plateNumber' && typeof value === 'string') {
              value = value.toUpperCase();
            }
            // Floor odometer to integer
            if (key === 'currentOdoMeter' && typeof value === 'number') {
              value = Math.floor(value);
            }

            motorcycle[key] = value;
          });
        });

        return {success: true};
      } catch (error) {
        console.error('[useMotorcycle] updateMotorcycle failed:', error);
        return {success: false, error: error.message};
      }
    },
    [realm],
  );

  /**
   * Shorthand to update only the odometer reading.
   * Useful for quick odometer logging.
   *
   * @param {Realm.BSON.ObjectId} motorcycleId - The motorcycle's primary key
   * @param {number} newOdoMeter - New odometer reading in KM
   * @returns {{ success: boolean, error?: string }}
   */
  const updateOdometer = useCallback(
    (motorcycleId, newOdoMeter) => {
      return updateMotorcycle(motorcycleId, {currentOdoMeter: newOdoMeter});
    },
    [updateMotorcycle],
  );

  // ─── DELETE ───────────────────────────────────────────────────────
  /**
   * Delete a single motorcycle by ID.
   *
   * @param {Realm.BSON.ObjectId} motorcycleId - The motorcycle's primary key
   * @returns {{ success: boolean, error?: string }}
   */
  const deleteMotorcycle = useCallback(
    motorcycleId => {
      if (!motorcycleId) {
        return {success: false, error: 'Motorcycle ID is required'};
      }

      try {
        realm.write(() => {
          const motorcycle = realm.objectForPrimaryKey(
            Motorcycle,
            motorcycleId,
          );
          if (!motorcycle) {
            throw new Error(`Motorcycle not found: ${motorcycleId}`);
          }
          realm.delete(motorcycle);
        });

        return {success: true};
      } catch (error) {
        console.error('[useMotorcycle] deleteMotorcycle failed:', error);
        return {success: false, error: error.message};
      }
    },
    [realm],
  );

  /**
   * Delete ALL motorcycles. Use with caution.
   * Typically gated behind a user confirmation dialog.
   *
   * @returns {{ success: boolean, count?: number, error?: string }}
   */
  const deleteAllMotorcycles = useCallback(() => {
    try {
      const count = realm.objects(Motorcycle).length;

      realm.write(() => {
        const allMotorcycles = realm.objects(Motorcycle);
        realm.delete(allMotorcycles);
      });

      return {success: true, count};
    } catch (error) {
      console.error('[useMotorcycle] deleteAllMotorcycles failed:', error);
      return {success: false, error: error.message};
    }
  }, [realm]);

  // ─── LOOKUP ───────────────────────────────────────────────────────
  /**
   * Get a single motorcycle by its primary key.
   * Returns null if not found.
   *
   * @param {Realm.BSON.ObjectId} motorcycleId - The motorcycle's primary key
   * @returns {Motorcycle|null}
   */
  const getMotorcycleById = useCallback(
    motorcycleId => {
      if (!motorcycleId) {
        return null;
      }
      return realm.objectForPrimaryKey(Motorcycle, motorcycleId) ?? null;
    },
    [realm],
  );

  // ─── Return ───────────────────────────────────────────────────────
  return {
    motorcycles,
    motorcycleCount,
    createMotorcycle,
    updateMotorcycle,
    updateOdometer,
    deleteMotorcycle,
    deleteAllMotorcycles,
    getMotorcycleById,
  };
}
