import { configureStore } from '@reduxjs/toolkit';

// 액션 타입
const SET_USER = 'SET_USER';

// 액션 생성자
export const setUser = user => ({
  type: SET_USER,
  payload: user
});

// 리듀서
const userReducer = (state = null, action) => {
  switch (action.type) {
    case SET_USER:
      return action.payload;
    default:
      return state;
  }
};

// 스토어 생성
const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
