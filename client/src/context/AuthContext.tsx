import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import useApi from '../hooks/useApi';
import { jwtDecode } from 'jwt-decode';
import { AuthAction, AuthContextType, AuthState } from '../types/globals';

const initialState: AuthState = {
  user: null,
  token: null,
  isRefreshing: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isRefreshing: false,
      };
    case 'LOGOUT':
      return { ...initialState };
    case 'REFRESH_START':
      return { ...state, isRefreshing: true };
    case 'REFRESH_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isRefreshing: false,
      };
    case 'REFRESH_FAILED':
      return { ...state, isRefreshing: false };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType>({
  state: initialState,
  dispatch: () => {
    console.warn('dispatch called outside of AuthProvider');
  },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const apiOptions = useMemo(() => ({ auto: false }), []);
  const { post } = useApi('/auth/refresh', apiOptions);

  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token) {
      try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        const currentTime = Date.now() / 1000;

        if (exp <= currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return initialState;
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return initialState;
      }
    }

    return { user, token, isRefreshing: false };
  });
  const refreshTimeoutRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current || state.isRefreshing) {
      return;
    }

    try {
      isRefreshingRef.current = true;
      dispatch({ type: 'REFRESH_START' });

      const result = await post({});

      if (result && result.accessToken) {
        dispatch({
          type: 'REFRESH_SUCCESS',
          payload: { user: result.user, token: result.accessToken },
        });
      } else {
        dispatch({ type: 'REFRESH_FAILED' });
      }
    } catch (err) {
      console.error('Token refresh failed:', err);

      if (state.token) {
        try {
          const { exp } = jwtDecode<{ exp: number }>(state.token);
          if (exp <= Date.now() / 1000) {
            dispatch({ type: 'LOGOUT' });
          } else {
            dispatch({ type: 'REFRESH_FAILED' });
          }
        } catch {
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [post, state.token]);

  const scheduleTokenRefresh = useCallback(
    (token: string) => {
      try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }

        const timeUntilExpiry = exp - currentTime;
        const refreshThreshold = 60;

        if (timeUntilExpiry <= 0) {
          dispatch({ type: 'LOGOUT' });
          return;
        }

        const refreshTime = Math.max(
          (timeUntilExpiry - refreshThreshold) * 1000,
          1000,
        );

        refreshTimeoutRef.current = setTimeout(() => {
          refreshToken().catch(() => {});
        }, refreshTime);
      } catch (err) {
        console.error('Invalid token:', err);
        dispatch({ type: 'LOGOUT' });
      }
    },
    [refreshToken],
  );

  useEffect(() => {
    if (state.token && !state.isRefreshing) {
      scheduleTokenRefresh(state.token);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [state.token, scheduleTokenRefresh]);

  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [state.token, state.user]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
