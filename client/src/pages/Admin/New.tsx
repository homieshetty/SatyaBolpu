import { useEffect, useMemo, useState } from "react";
import { CultureState, DetailsType, LocationState, NewProps, NewState, PostState } from "../../types/globals";
import ProgressBar from "../../components/ProgressBar";
import Editor from "../../components/Editor";
import { Mode } from "../../types/enums";
import MAP from "../MAP";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Form from "../../components/Form";
import Button from "../../components/Button";
import { toast } from "react-toastify";
import useDraftLoader from "../../hooks/useDraftLoader";
import useNewData from "../../hooks/useNewData";
import { getFields, getDetails } from "../../utils/fields";
import useApi from "../../hooks/useApi";
import Title from "../../components/Title";
import { kebabToTitleCase } from "../../utils/utils";

const New = ({ type }: NewProps) => {

  const [progress, setProgress] = useState<number>(0);
  const [step, setShowStep] = useState<string>('');
  const draftable = type === "culture" || type === "post" || type === "location";
  const multipleSteps = type === "post" || type === "culture" || type === "location";
  const [state, setState] = useState<NewState | null>(() => {
    if (type === "post") {
      return {
        details: null,
        content: ""
      }
    } else if (type === "culture") {
      return {
        details: null,
        content: ""
      }
    } else if (type === "location") {
      return {
        details: {
          name: ""
        },
        location: null
      }
    }
    return getDetails(null, type);
  });

  const { id } = useParams();
  if(draftable) {
    useDraftLoader(
      id,
      type,
      setState
    );
  }
  const data = useNewData(type);

  const { state: authState } = useAuth();
  const draftsApi = useApi("/drafts", { auto: false });
  const navigate = useNavigate();


  const steps = useMemo(() => {
    if(!data || !state) return {};
    const { submitApi, ...options } = data;

    return {
    "Details":
        <Form<DetailsType>
          fields={getFields(type, options)}
          state={getDetails(state, type) as DetailsType}
          submitEndpoint={draftable ? `/${type}s/draft/${id}/details` : data.submitApi}
          onSubmit={(_, setFormData, res) => {
            if(!draftable) {
              setFormData(getDetails(null, type) as DetailsType);
              setState(null);
            } else
              setState(prev => ({
                ...prev,
                details: res[type].details
              }));
          }}
          submitText="Save Details"
          loadingText="Saving"
          toastMsg={`${type.charAt(0).toUpperCase() + type.slice(1)} details saved successfully`}
        />,
    ...(
      type === "post" || type === "culture" ?
        {
          "Editor":
            <Editor
              state={state as PostState | CultureState}
              setState={setState as React.Dispatch<React.SetStateAction<PostState | CultureState>>}
              endpoint={`${type}s`}
            />
        }
        : type === "location" ?
          {
            "Location":
              <MAP
                state={state as LocationState}
                setState={setState as React.Dispatch<React.SetStateAction<typeof state>>}
                editMode={Mode.LOCATION}
              />
          }
          : {}
    )
  }}, [ state, data ]);

  useEffect(() => {
    if (Object.keys(steps).length <= 0) return;
    setShowStep(Object.keys(steps)[Math.min(progress, 100) / (100 / (Object.keys(steps).length - 1))]);
  }, [progress]);

  useEffect(() => console.log(state), [state])


  const handleUpload = async () => {
    let res = await data?.submitApi?.post(state);
    if (!res) return;
    if(type === "culture" || type === "event" || type === "post" || type === "location")
    res = await draftsApi.del({ endpoint: `/drafts/${id}` });
    if (!res) return;
    toast.success(`Uploaded successfully`);
    navigate("/add");
  }

  if (!authState.token || authState.user?.role !== 'admin') {
    return <Navigate to={'/404'} replace />
  }

  if (!state) return;

  return (
    <div className="w-full mt-20 mb-40 flex flex-col gap-20 items-center justify-center">

      <div className="w-full flex flex-col items-center justify-center gap-10">
        {
          multipleSteps ? 
          <ProgressBar
            steps={steps}
            progress={progress}
            setProgress={setProgress}
            setShowStep={setShowStep}
            state={state}
          /> :
          <Title 
            title={`New ${kebabToTitleCase(type)}`}
          />
        }

        {
          state && multipleSteps && Object.values(state).every(v => Boolean(v)) &&
          <Button
            content={`Upload ${type}`}
            loadingText="Uploading"
            loading={data?.submitApi?.loading}
            onClick={handleUpload}
          />
        }

      </div>

      {
        steps[step as keyof typeof steps]
      }
    </div>
  )
}

export default New;