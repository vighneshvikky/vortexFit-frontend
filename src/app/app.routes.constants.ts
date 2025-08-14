

export const API_ROUTES = {
  USER: {
    BASE: '/user',
    UPDATE_PROFILE: '/update-profile',
    APPROVED_TRAINER: '/approved-trainer',
    GET_TRAINER_DATA: (id: string) => `/getTrainerData/${id}`
  },
  SCHEDULES: {
    BASE: '/schedules',
    CREATE: '/create',
    GENERATE_SLOTS: (trainerId: string) => `/generateSlots/${trainerId}`,
    GET_SCHEDULES: `/getSchedules`,
    DELETE_SCHEDULES: (id: string) => `/deleteSchedule/${id}`
  },
  S3: {
    GENERATE_UPLOAD_URL: '/s3/generate-upload-url'
  },
  TRAINER: {
    BASE: '/trainer',
    UPDATE_PROFILE: '/update-trainer-profile',
  },
  PAYMENT: {
    BASE: '/payments',
    CREATE_ORDER: '/create-order',
    VERIFY_PAYMENT: '/verify-payment'
  }
};
