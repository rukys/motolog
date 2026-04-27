export const SERVICE_ITEM_TYPES = [
  'Engine Oil',
  'Oil Filter',
  'Air Filter',
  'Brake Pads',
  'Brake Fluid',
  'Chain & Sprocket',
  'Tires',
  'Battery',
  'Spark Plug',
  'Coolant',
  'Transmission Oil',
  'V-Belt',
  'Roller',
  'Clutch',
  'Other',
] as const;

export type ServiceItemType = typeof SERVICE_ITEM_TYPES[number];
