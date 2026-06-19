import { useMemo } from 'react';
import {
  ICulture,
  IEvent,
  ILocation,
  IPost,
  IOther,
  NewData,
  NewType,
} from '../types/globals';
import useApi from './useApi';

const useNewData = <T extends NewType>(type: T): NewData<T> | null => {
  const postsApi = useApi('/posts?fields=title,shortTitle', {
    auto: type === 'post',
  });

  const eventsApi = useApi('/events?fields=title', {
    auto: type === 'event',
  });

  const locationsApi = useApi('/locations?fields=name', {
    auto:
      type === 'location' ||
      type === 'post' ||
      type === 'event' ||
      type === 'culture',
  });

  const tagsApi = useApi('/others/tags', {
    auto: type === 'post' || type === 'tag',
  });

  const culturesApi = useApi('/cultures?fields=title', {
    auto: type === 'post' || type === 'culture' || type === 'event',
  });

  const postGroupsApi = useApi('/others/post-groups', {
    auto: type === 'post' || type === 'post-group',
  });

  const postTypesApi = useApi('/others/post-types', {
    auto: type === 'post' || type === 'post-type',
  });

  const postSubmitApi = useApi('/posts', { auto: false });
  const cultureSubmitApi = useApi('/cultures', { auto: false });
  const eventSubmitApi = useApi('/events', { auto: false });
  const tagSubmitApi = useApi('/others/tags', { auto: false });
  const postGroupSubmitApi = useApi('/others/post-groups', { auto: false });
  const postTypeSubmitApi = useApi('/others/post-types', { auto: false });
  const locationSubmitApi = useApi('/locations', { auto: false });

  return useMemo(() => {
    const submitApis = {
      post: postSubmitApi,
      culture: cultureSubmitApi,
      event: eventSubmitApi,
      location: locationSubmitApi,
      tag: tagSubmitApi,
      'post-group': postGroupSubmitApi,
      'post-type': postTypeSubmitApi,
    };

    switch (type) {
      case 'post': {
        const { titles, shortTitles } = postsApi.data?.posts?.reduce(
          (acc: { titles: string[]; shortTitles: string[] }, post: IPost) => {
            acc.titles.push(post.title);
            acc.shortTitles.push(post.shortTitle);
            return acc;
          },
          {
            titles: [],
            shortTitles: [],
          },
        ) ?? {
          titles: [],
          shortTitles: [],
        };

        return {
          titles,
          shortTitles,
          tags:
            tagsApi.data?.tags?.map((tag: IOther) => ({
              label: tag.name,
              value: tag.id,
            })) ?? [],
          cultures:
            culturesApi.data?.cultures?.map((culture: ICulture) => ({
              label: culture.title,
              value: culture.id,
            })) ?? [],
          postTypes:
            postTypesApi.data?.postTypes?.map((postType: IOther) => ({
              label: postType.name,
              value: postType.id,
            })) ?? [],
          postGroups:
            postGroupsApi.data?.postGroups?.map((postGroup: IOther) => ({
              label: postGroup.name,
              value: postGroup.id,
            })) ?? [],
          locations:
            locationsApi.data?.locations?.map((location: ILocation) => ({
              label: location.name,
              value: location.id,
            })) ?? [],
          submitApi: submitApis.post,
        };
      }

      case 'culture':
        return {
          titles:
            culturesApi.data?.cultures?.map(
              (culture: ICulture) => culture.title,
            ) ?? [],
          locations:
            locationsApi.data?.locations?.map((location: ILocation) => ({
              label: location.name,
              value: location.id,
            })) ?? [],
          submitApi: submitApis.culture,
        };

      case 'event':
        return {
          titles:
            eventsApi.data?.events?.map((event: IEvent) => event.title) ?? [],
          cultures:
            culturesApi.data?.cultures?.map((culture: ICulture) => ({
              label: culture.title,
              value: culture.id,
            })) ?? [],
          locations:
            locationsApi.data?.locations?.map((location: ILocation) => ({
              label: location.name,
              value: location.id,
            })) ?? [],
          submitApi: submitApis.event,
        };

      case 'location':
        return {
          names:
            locationsApi.data?.locations.map(
              (location: ILocation) => location.name,
            ) ?? [],
          submitApi: submitApis.location,
        };

      case 'tag':
        return {
          names: tagsApi.data?.tags.map((tag: IOther) => tag.name) ?? [],
          submitApi: submitApis.tag,
        };

      case 'post-group':
        return {
          names:
            postGroupsApi.data?.postGroups?.map(
              (postGroup: IOther) => postGroup.name,
            ) ?? [],
          submitApi: submitApis['post-group'],
        };

      case 'post-type':
        return {
          names:
            postTypesApi.data?.postTypes?.map(
              (postType: IOther) => postType.name,
            ) ?? [],
          submitApi: submitApis['post-type'],
        };

      default:
        return null;
    }
  }, [
    type,
    postsApi.data,
    eventsApi.data,
    locationsApi.data,
    tagsApi.data,
    culturesApi.data,
    postGroupsApi.data,
    postTypesApi.data,
    postSubmitApi,
    cultureSubmitApi,
    eventSubmitApi,
    locationSubmitApi,
    tagSubmitApi,
    postGroupSubmitApi,
    postTypeSubmitApi,
  ]) as unknown as NewData<T> | null;
};

export default useNewData;
