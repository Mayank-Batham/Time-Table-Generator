export interface TimeSlot {
  day: string;
  time: string;
  isAvailable: boolean;
}

export interface ClassRequirement {
  id: string;
  name: string;
  oneHourSlots: number;
  twoHourSlots: number;
  notes: string;
}

export interface FormData {
  requirements: ClassRequirement[];
}