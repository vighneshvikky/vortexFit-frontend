export const API_ROUTES = {
  USER: {
    BASE: '/user',
    UPDATE_PROFILE: '/update-profile',
    APPROVED_TRAINER: '/approved-trainer',
    GET_TRAINER_DATA: (id: string) => `/getTrainerData/${id}`,
    GET_USER_DATA: (id: string) => `/getuserData/${id}`,
  },
  SCHEDULES: {
    BASE: '/schedules',
    CREATE: '/create',
    GENERATE_SLOTS: (trainerId: string, date: string) =>
      `/generateSlots/${trainerId}/${date}`,
    GET_SCHEDULES: `/getSchedules`,
    DELETE_SCHEDULES: (id: string) => `/deleteSchedule/${id}`,
  },
  S3: {
    BASE: '/s3',
    GENERATE_UPLOAD_URL: '/generate-upload-url',
    GENERATE_DOWNLOAD_URL: '/generate-download-url',
  },
  TRAINER: {
    BASE: '/trainers',
    UPDATE_PROFILE: '/update-trainer-profile',
    GET_USER_DATA: (id: string) => `/getuserData/${id}`,
  },
  PAYMENT: {
    BASE: '/payments',
    CREATE_ORDER: '/create-order',
    VERIFY_PAYMENT: '/verify-payment',
  },
  BOOKING: {
    BASE: '/bookings',
    GET_BOOKINGS: '/getBookings',
    CHANGE_STATUS: '/changeStatus',
    GET_BOOKINGS_BY_FILTER: '/getFilteredBookings',
    GET_CLIENTS: '/getClients',
    GET_STATS: '/stats',
  },
CHAT: {
  BASE: '/chat',

  MESSAGES: {
    BASE: '/chat/messages',
    GET: (roomId: string, page = 1, limit = 3) =>
      `/chat/messages/${roomId}?page=${page}&limit=${limit}`,
    SEND: '/chat/messages',
    MARK_AS_READ: '/chat/messages/read',
    UNREAD_COUNT: (userId: string) => `/chat/messages/unread-count/${userId}`,
    SEARCH: (roomId: string, query: string) =>
      `/chat/messages/search/${roomId}?q=${encodeURIComponent(query)}`,
  },

  ROOMS: {
    BASE: '/chat/rooms',
    GET_BY_USER: (userId: string) => `/chat/rooms/${userId}`,
    CREATE: '/chat/rooms',
    GET_OR_CREATE: '/chat/rooms/get-or-create',
  },
}

};
