import { isRejectedWithValue } from '@reduxjs/toolkit'

/**
 * Log a warning and show a toast!
 */
export const rtkQueryErrorLogger =
  (api) => (next) => (action) => {
    // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
    if (isRejectedWithValue(action)) {
      console.warn('Rejected action!', action)
    }

    return next(action)
  }