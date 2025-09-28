export const CATEGORIES = [
  { value: 'cardio', label: 'Cardio' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'martial_arts', label: 'Martial Arts' },
  { value: 'fitness', label: 'Fitness' },
];

export const CATEGORY_TO_SPECIALIZATIONS: { [key: string]: string[] } = {
  cardio: ['HIIT', 'Zumba', 'Endurance Training'],
  yoga: ['Hatha Yoga', 'Vinyasa', 'Power Yoga'],
  martial_arts: ['Karate', 'Taekwondo', 'Kickboxing'],
  fitness: ['Weight Lifting', 'CrossFit', 'Bodybuilding'],
};

export const CATEGORY_IMAGES: { [key: string]: string } = {
  cardio:
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
  yoga: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=1000&q=80',
  martial_arts:
    'https://images.unsplash.com/photo-1603394513444-d0d8ff15bff4?auto=format&fit=crop&w=1000&q=80',
  fitness:
    'https://images.unsplash.com/photo-1599058917212-d750089bc07d?auto=format&fit=crop&w=1000&q=80',
};

export const REJECTION_REASONS = [
  { value: 'certification', label: 'Certification is not proper' },
  { value: 'experience', label: 'Insufficient experience documentation' },
  { value: 'documents', label: 'Required documents are missing or unclear' },
  { value: 'qualifications', label: 'Qualifications do not meet requirements' },
];

export const SESSION_TYPES = [
  { value: 'interactive', label: 'Interactive Session' },
  { value: 'one-to-one', label: 'One-to-One Session' },
  { value: 'group', label: 'Group Session' },
  { value: 'other', label: 'Other' },
];

export const DAYSOFWEEK = [
      { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
]
