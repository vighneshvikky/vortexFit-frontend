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
