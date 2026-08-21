import { WithTimestamps } from "../types";

export type VehicleRow = {
  id: string;
  plate_number: string;
  vin: string;
  make: string;
  model: string;
  vehicle_type: string;
  body_type: string | null;
  color: string | null;
  first_registered: string | null;
  fuel_type: string | null;
  transmission: string | null;
  seats: number | null;
  registration_status: string | null;
  eu_date: string | null;
  last_eu_approved: string | null;
  image_url: string | null;
  maintenance_responsible_id: string | null;
  with_svv_data: boolean;
} & WithTimestamps;
