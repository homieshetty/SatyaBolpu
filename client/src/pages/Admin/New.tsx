import { useEffect, useMemo, useState } from "react";
import { CultureState, DetailsType, NewProps, NewState, PostState } from "../../types/globals";
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
import { getFields, getInitialDetails } from "../../utils/fields";
import useApi from "../../hooks/useApi";

const New = ({ type }: NewProps) => {

  const [progress, setProgress] = useState<number>(0);
  const [step, setShowStep] = useState<string>('');
  const [state, setState] = useState<NewState | null>(() => {
    if (type === "post") {
      return {
        details: null,
        content: "",
        location: null
      }
    } else if (type === "culture") {
      return {
        details: null,
        content: ""
      }
    } else if (type === "event") {
      return {
        details: null,
        location: null
      }
    } else if (type === "location") {
      return {
        details: {
          name: ""
        },
        location: null
      }
    } else if (type === "tag") {
      return {
        tag: ""
      };
    } else if (type === "post-group") {
      return {
        postGroup: ""
      };
    } else if (type === "post-type") {
      return {
        postType: ""
      };
    };
    return null;
  });

  const { id } = useParams();
  useDraftLoader(
    id,
    type,
    setState
  );
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
          state={getInitialDetails(type, state) as DetailsType}
          setState={(details) => {
            setState(prev => ({
              ...prev,
              details
            }))
          }}
          submitEndpoint={`/${type}s/draft/${id}/details`}
          submitText="Save Details"
          loadingText="Saving"
          toastMsg={`${type.charAt(0).toUpperCase() + type.slice(1)} details saved successfully`}
        />,
    ...(
      type === "post" ?
        {
          "Editor":
            <Editor
              state={state as PostState}
              setState={setState as React.Dispatch<React.SetStateAction<PostState | CultureState>>}
              endpoint="posts"
            />,
          ...((state as PostState).details?.locationSpecific && { "Location": <MAP editMode={Mode.POST} /> })
        }
        : type === "culture" ?
          {
            "Editor":
              <Editor
                state={state as CultureState}
                setState={setState as React.Dispatch<React.SetStateAction<PostState | CultureState>>}
                endpoint="cultures"
              />,
          }
          : type === "event" ?
            {
              "Location": <MAP editMode={Mode.EVENT} />
            }
            : type === "location" ?
              {
                "Location": <MAP editMode={Mode.LOCATION} />
              }
              : {}
    )
  }}, [ state ]);

  useEffect(() => {
    if (Object.keys(steps).length <= 0) return;
    setShowStep(Object.keys(steps)[Math.min(progress, 100) / (100 / (Object.keys(steps).length - 1))]);
  }, [progress]);


  const handleUpload = async () => {
    let res = await data?.submitApi?.post(state);
    if (!res) return;
    if(type === "culture" || type === "event" || type === "post" || type === "location")
      res = await draftsApi.del({ endpoint: `/drafts/${id}` });
    toast.success(`Uploaded successfully`);
    navigate("/add");
  }

  if (!authState.token || authState.user?.role !== 'admin') {
    return <Navigate to={'/404'} replace />
  }

  if (!state) return;

  return (
    <div className="w-full mt-20 mb-40 flex flex-col gap-10 items-center justify-center">
      {/* <Title title={state.details ? `New ${type} - ${state.details.title}` : `New Draft ${type}`}/> */}

      <ProgressBar
        steps={steps}
        progress={progress}
        setProgress={setProgress}
        setShowStep={setShowStep}
        state={state}
      />

      {
        progress >= 100 &&
        <Button
          content={`Upload ${type}`}
          loadingText="Uploading"
          loading={data?.submitApi?.loading}
          onClick={handleUpload}
        />
      }

      {
        steps[step as keyof typeof steps]
      }
    </div>
  )
}

export default New;