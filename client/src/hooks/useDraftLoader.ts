import { useEffect } from "react";
import { NewProps, NewState } from "../types/globals";
import { validateCultureDetails, validateEventDetails, validateLocation, validateLocationDetails, validateLocationFields, validatePostDetails } from "../utils/validate";
import useApi from "./useApi";
import { useNavigate } from "react-router-dom";

const useDraftLoader = (
  id: string | undefined,
  type: NewProps['type'],
  setState: React.Dispatch<React.SetStateAction<NewState | null>>,
) => {
  const draftsApi = useApi(`/drafts/${id}`);
  const navigate = useNavigate();

  useEffect(() => {
    if(!draftsApi.data && draftsApi.error) {
      navigate("/add");
      return;
    };
    if(!draftsApi.data) return;
    const data = draftsApi.data.draft;
    if (type === "post") {
      setState({
        details: validatePostDetails(data.details) ? data.details : null,
        content: data.content ?? "",
        location: validateLocation(data.location) ? data.location : null
      })
    } else if (type === "culture") {
      setState({
        details: validateCultureDetails(data.details) ? data.details : null,
        content: data.content ?? ""
      })
    } else if (type === "event") {
      setState({
        details: validateEventDetails(data.details) ? data.details : null,
        location: validateLocation(data.location) ? data.location : null
      })
    } else if (type === "location") {
      setState({
        details: validateLocationDetails(data.details) ? data.details : null,
        location: validateLocationFields(data.location) ? data.location : null
      })
    } else {
      setState(null);
    }
  }, [draftsApi.data]);
};

export default useDraftLoader;