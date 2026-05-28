import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { BlogCardProps } from "../types/globals";

export const BlogSkeletonCard = () => {
  return (
    <div
      className="w-full flex items-center justify-around bg-gray-500 h-32 p-3"
    >
      <div className="w-1/5 h-full bg-gray-400"></div>

      <div className="flex flex-col gap-2 text-gray-200">
        <div className="text-[1.25rem]">........</div>
        <div>...</div>
      </div>

      <div>
        <div className="rounded-full">
        </div>
        <div>
        </div>
      </div>

      <div>
      </div>

      <div 
        className="text-gray-400"
      >
      </div>

    </div>
  )
}

export const BlogCard = ({
  title,
  subtitle,
  type,
  image,
  userId,
  createdAt
}: BlogCardProps) => {

  const [user, setUser] = useState<{ name: string, image: string } | null>(null);

  const userApi = useApi(`/users/${userId}?fields=name,image`);

  useEffect(() => {
    if(!userApi.data) return;
    setUser(userApi.data?.user);
  }, [userApi.data]);

  return (
    <div
      className="w-full flex items-center justify-around text-white h-32"
    >
      <div>
        <img src={image} alt="blog image" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[1.25rem]">{title}</div>
        <div>{subtitle}</div>
      </div>

      <div>
        <div className="rounded-full">
          <img src={user?.image} alt="user image" />
        </div>
        <div>
          {user?.name}
        </div>
      </div>

      <div>
        {type}
      </div>

      <div 
        className="text-gray-400"
      >
        {createdAt.toDateString()}
      </div>

    </div>
  )
}