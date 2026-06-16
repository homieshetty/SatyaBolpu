import { useNavigate } from "react-router-dom";
import CardList from "../components/CardList";
import Title from "../components/Title";
import useApi from "../hooks/useApi";
import { useEffect, useState } from "react";
import { FilterGroups } from "../components/Filters";
import { ICulture, IOther, NormalCardProps, PostGroupProps } from "../types/globals";
import { NormalCard, NormalSkeletonCard } from "../components/NormalCard";
import PostGroupCard, { PostGroupSkeleton } from "../components/PostGroupCard";
import DropDown from "../components/DropDown";

const Posts = () => {
  const navigate = useNavigate();
  const postsApi = useApi("/posts", { auto: false });
  const culturesApi = useApi("/cultures?fields=title");
  const tagsApi = useApi("/others/tags?sortBy=tag");
  const postTypesApi = useApi("/others/post-types?sortBy=name");
  const [displayType, setDisplayType] = useState<"posts" | "postGroups">((
    sessionStorage.getItem("displayType") ?? "posts") as "posts" | "postGroups"
  );
  const [filterGroups, setFilterGroups] = useState<FilterGroups>({});

  useEffect(() => {
    if(culturesApi.data) {
      setFilterGroups(prev => ({
        ...prev,
        "Culture": { 
          options: culturesApi.data.cultures.map((c: ICulture) => ({ name: c.title, value: c.id })), 
          color: "#fa7b55"
        }
      }));
    } 

    if(tagsApi.data) {
      setFilterGroups(prev => ({
        ...prev,
        "Tag": {
          options: tagsApi.data.tags.map((t: IOther) => ({ name: t.name, value: t.id })),
          color: "#fce38d"
        }
      }));
    }

    if(postTypesApi.data) {
      setFilterGroups(prev => ({
        ...prev,
        "Post type": {
          options: postTypesApi.data.postTypes.map((pt: IOther) => ({ name: pt.name, value: pt.id })),
          color: "#d0fc8d"
        }
      }));
    }
  }, [culturesApi.data, tagsApi.data, postTypesApi.data]);

  const handleEdit = async (id: string) => {
    if(!id) return;
    const res = await postsApi.refetch({ endpoint: `/drafts/post/${id}`, method: "POST" });
    if(!res) return;
    navigate(`/add/post/${res._id}`);
  }

  useEffect(() => {
    if(displayType === "postGroups") {
      sessionStorage.setItem("displayType", "postGroups");
    } else {
      sessionStorage.removeItem("displayType");
    }
  }, [displayType]);

  return (
    <div 
      className="w-full min-h-screen py-20"
    >
      <Title title="All Posts"/>
      <div
        className="w-2/3 mx-auto flex items-center justify-end"
      >
        <DropDown<"posts" | "postGroups">
          options={[
            { name: "Post", value: "posts" },
            { name: "Post group", value: "postGroups" }
          ]}
          defaultValue="posts"
          state={displayType}
          setState={setDisplayType}
        />
      </div>
      {
        displayType === "postGroups" 
          ?
          <CardList<PostGroupProps>
            key={displayType}
            Card={PostGroupCard}
            SkeletonCard={PostGroupSkeleton}
            cardsPerPage={10}
            apiEndpoint="posts/post-groups"
            dataKey="postGroups"
            orientation="column"
            handleEdit={handleEdit}
            filterGroups={filterGroups}
            sortOptions={{
              "Name": "name",
              "Date": "createdAt"
            }}
          /> 
          :
          <CardList<NormalCardProps>
            key={displayType}
            Card={NormalCard}
            SkeletonCard={NormalSkeletonCard}
            cardsPerPage={10}
            apiEndpoint={"posts"}
            dataKey="posts"
            selectFields="fields=shortTitle,description,image"
            orientation="column"
            filterGroups={filterGroups}
            sortOptions={{
              "Title": "shortTitle",
              "Date": "createdAt"
            }}
          /> 
      }
    </div>
  )
};

export default Posts;
