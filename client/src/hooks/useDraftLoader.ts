import { useEffect } from "react";
import { NewProps, NewState } from "../types/globals";
import { validateCultureDetails, validateEventDetails, validatePostDetails } from "../utils/validate";
import useApi from "./useApi";

const useDraftLoader = (
  id: string | undefined,
  type: NewProps['type'],
  setState: React.Dispatch<React.SetStateAction<NewState | null>>,
) => {
  const draftsApi = useApi(`/drafts/${id}`);

  useEffect(() => {
    if(!draftsApi.data) return;
    const data = draftsApi.data.draft;
    if (type === "post") {
      setState({
        details: validatePostDetails(data.details) ? data.details : null,
        content: data.content ?? "",
        location: data.location ?? null
      })
    } else if (type === "culture") {
      setState({
        details: validateCultureDetails(data.details) ? data.details : null,
        content: data.content ?? ""
      })
    } else if (type === "event") {
      setState({
        details: validateEventDetails(data.details) ? data.details : null,
        location: data.location ?? null
      })
    } else if (type === "location") {
      setState({
        details: data.details.name ? data.details : null,
        location: data.location ?? null
      })
    } else {
      setState(null);
    }
  }, [draftsApi.data]);
};

export default useDraftLoader;