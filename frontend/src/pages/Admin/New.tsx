import { useEffect, useMemo, useState } from "react";
import { CultureDetailsType, CultureState, EventDetailsType, EventState, ICulture, IEvent, IPost, IPostGroup, IPostType, ITag, LocationState, PostDetailsType, PostState } from "../../types/globals";
import ProgressBar from "../../components/ProgressBar";
import Editor from "../../components/Editor";
import { Mode } from "../../types/enums";
import MAP from "../MAP";
import useApi from "../../hooks/useApi";
import { Navigate, useParams } from "react-router-dom";
import { validateCultureDetails, validateEventDetails, validatePostDetails } from "../../utils/validate";
import { useAuth } from "../../context/AuthContext";
import Form from "../../components/Form";
import { getCultureFields, getEventFields, getPostFields, initialCultureDetails, initialEventDetails, initialPostDetails } from "../../utils/fields";

type NewProps = {
  type: "post" | "event" | "culture" | "location";
}

type State = PostState | CultureState | EventState | LocationState;

const New = ({
  type,
} : NewProps) => {

  const [progress, setProgress] = useState<number>(0);
  const [step, setShowStep] = useState<string>('');
  const [state, setState] = useState<State>(() => {
    let rest;
    if(type === "post") {
      rest = {
        content: "",
        location: null
      }
    } else if(type === "culture") {
      rest = {
        content: ""
      }
    } else if(type === "event" || type === "location") {
      rest = {
        location: null
      }
    }
    return { details: null, ...rest } as State;
  });

  const { id } = useParams();
  const postsApi = useApi("/posts?fields=title,shortTitle", { auto: type === "post" }); 
  const eventsApi = useApi("/events?fields=title", { auto: type === "event" });
  const tagsApi = useApi("/others/tags", { auto: type === "post" });
  const culturesApi = useApi("/cultures?fields=title", { auto: type === "post" || type === "culture" || type === "event" });
  const postGroupsApi = useApi("/others/post-groups", { auto: type === "post" });
  const postTypesApi = useApi("/others/post-types", { auto: type === "post" });
  const draftsApi = useApi('/drafts', { auto: false });

  const { state: authState } = useAuth();

  useEffect(() => {
    if(!id) return;
    const fetch = async () => {
      const res = await draftsApi.refetch({ endpoint: `/drafts/${id}`, method: "GET" });
      if(!res) return;
      const newState =
        type === "post" ? 
          {
            details: validatePostDetails(res.draft.details) ? res.draft.details : null,
            content: res.draft.content ?? "",
            location: res.draft.location ?? null
          }
        : type === "culture" ?
          {
            details: validateCultureDetails(res.draft.details) ? res.draft.details : null,
            content: res.draft.content ?? ""
          }
        : type === "event" ?
          {
            details: validateEventDetails(res.draft.details) ? res.draft.details : null,
            location: res.draft.location ?? ""
          }
        : 
          {
            details: null,
            location: null
          };

      setState(newState);
    }

    fetch();
  }, [id]);

  const steps = useMemo(() => ({
    "Details" : 
      type === "post" ?
        <Form<PostDetailsType>
          state={(state.details ?? initialPostDetails) as PostDetailsType}
          fields={
            getPostFields(
              {
                titles: postsApi.data?.posts.map((p: IPost) => p.title),
                shortTitles: postsApi.data?.posts.map((p: IPost) => p.shortTitle),
                tags: tagsApi.data?.tags.map((t: ITag) => ({
                  label: t.tag,
                  value: t.id
                })),
                cultures: culturesApi.data?.cultures.map((c: ICulture) => ({
                  label: c.title,
                  value: c.id
                })),
                postTypes: postTypesApi.data?.postTypes.map((pt: IPostType) => ({
                  label: pt.name,
                  value: pt.id
                })),
                postGroups: postGroupsApi.data?.postGroups.map((pg: IPostGroup) => ({
                  label: pg.name,
                  value: pg.id
                }))
              }
            )}
          submitEndpoint={`/${type}s/draft/${id}/details`}
          submitText="Save Details"
          loadingText="Saving"
          toastMsg="Post details saved successfully"
        /> : 
        type === "culture" ? 
          <Form<CultureDetailsType>
            state={(state.details ?? initialCultureDetails) as CultureDetailsType}
            fields={
              getCultureFields({
                titles: culturesApi.data?.cultures.map((c: ICulture) => c.title),
              })
            }
            submitEndpoint={`/${type}s/draft/${id}/details`}
            submitText="Save Details"
            loadingText="Saving"
            toastMsg="Culture details saved successfully"
          />

          : 
          
          <Form<EventDetailsType>
            state={(state.details ?? initialEventDetails) as EventDetailsType}
            fields={
              getEventFields({
                titles: eventsApi.data?.events.map((e: IEvent) => e.title),
                cultures: culturesApi.data?.cultures.map((c: ICulture) => ({
                  label: c.title,
                  value: c.id
                }))
              })
            }
            submitEndpoint={`/${type}s/draft/${id}/details`}
            submitText="Save Details"
            loadingText="Saving"
            toastMsg="Culture details saved successfully"
          />,
    ...(
      type === "post" ?
        {
          "Editor" : 
          <Editor 
            state={state as PostState}
            setState={setState as React.Dispatch<React.SetStateAction<PostState | CultureState>>}
            endpoint="posts"
          />,
          ...((state as PostState).details?.locationSpecific && { "Location" : <MAP editMode={Mode.POST}/> })
        }
      : type === "culture" ?
        {
          "Editor" : 
          <Editor 
            state={state as CultureState}
            setState={setState as React.Dispatch<React.SetStateAction<PostState | CultureState>>}
            endpoint="posts"
          />,
        } 
      : type === "event" ?
        {
          "Location" : <MAP editMode={Mode.EVENT}/>
        }
      : type === "location" ? 
        {
          "Location": <MAP editMode={Mode.LOCATION}/>
        }
      : {}
    )
  }), [
    state, 
    tagsApi.data, 
    culturesApi.data, 
    postGroupsApi.data,
    postTypesApi.data,
    postsApi.data
  ]);

  useEffect(() => {
    if(Object.keys(steps).length <= 0) return;
    setShowStep(Object.keys(steps)[Math.min(progress * (Object.keys(steps).length - 1), 100) / 100]);
  }, [steps, progress]);

  if(!authState.token || authState.user?.role !== 'admin') {
    return <Navigate to={'/404'} replace />
  }

  return (
    <div className="mt-20 mb-40 flex flex-col gap-20 items-center justify-center">
      {/* <Title title={state.details ? `New ${type} - ${state.details.title}` : `New Draft ${type}`}/> */}

      <ProgressBar
        steps={steps} 
        progress={progress}
        setProgress={setProgress}
        setShowStep={setShowStep}
        state={state}
      />

      {
        steps[step as keyof typeof steps]
      }
    </div>
  )
}

export default New;