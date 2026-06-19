import { useEffect } from 'react';
import {
  validateCultureDetails,
  validateLocationDetails,
  validateLocationFields,
  validatePostDetails,
} from '../utils/validate';
import useApi from './useApi';
import { useNavigate } from 'react-router-dom';
import { NewState, NewType } from '../types/globals';

const useDraftLoader = (
  id: string | undefined,
  type: NewType,
  setState: React.Dispatch<React.SetStateAction<NewState | null>>,
) => {
  const draftsApi = useApi(`/drafts/${type}/${id}`);
  const navigate = useNavigate();

  useEffect(() => {
    if (!draftsApi.data && draftsApi.error) {
      navigate('/create');
      return;
    }
    if (!draftsApi.data) return;
    const data = draftsApi.data.draft;
    if (type === 'post') {
      setState({
        details: validatePostDetails(data.details) ? data.details : null,
        content: data.content ?? '',
      });
    } else if (type === 'culture') {
      setState({
        details: validateCultureDetails(data.details) ? data.details : null,
        content: data.content ?? '',
      });
    } else if (type === 'location') {
      setState({
        details: validateLocationDetails(data.details) ? data.details : null,
        location: validateLocationFields(data.location) ? data.location : null,
      });
    } else {
      setState(null);
    }
  }, [draftsApi.data]);
};

export default useDraftLoader;
