import { useParams } from "react-router-dom";
import Title from "../components/Title";
import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { IPost } from "../types/globals";

const Post = () => {
  const { postId } = useParams();
  const postsApi = useApi(`/posts/${postId}`);
  const [post, setPost] = useState<IPost | null>(null);

  useEffect(() => {
    if(postsApi.data) {
      setPost(postsApi.data.post);
    }
  }, [postsApi.data]);

  return (
    <div className="w-screen relative flex-col items-center justify-center gap-10 bg-black py-20">
      <Title title={post?.title ?? ""}/>

      <div 
        className="text-white text-[1.5rem] w-[90%] p-5 wrap-break-word whitespace-pre-wrap mx-auto"
        dangerouslySetInnerHTML={{
          __html: post?.content ?? ""
        }}
      >
      </div>
    </div>
  )
};

export default Post;
