import { CardType } from "../components/CardList";
import { ReactNode } from "react";
import { FilterGroups } from "../components/Filters";

export type Image = {
  src: string;
  alt: string;
};

export type ButtonProps = {
  content: ReactNode;
  className?: string;
  index?: number;
  ref?: React.RefObject<HTMLButtonElement[]> | React.RefObject<HTMLButtonElement>;
  type?: "submit" | "reset" | "button";
  onClick?: () => void;
  theme?: "light" | "dark";
  loading?: boolean;
  loadingText?: string;
};

export type BaseCardProps = {
  id: string,
  handleEdit?: (id: string) => {},
  handleDelete?: (id: string) => {}
};

export type MinimalCardProps = BaseCardProps & {
  title: string;
}

export type NormalCardProps = BaseCardProps & {
  title: string,
  description: string,
  image: string;
}

export type CollapsingCardProps = BaseCardProps & {
  title: string,
  description: string,
  images: string[]
}

export type RotatingCardProps = BaseCardProps & {
  title: string,
  description: string,
  image: string
}

export type BlogCardProps = BaseCardProps & {
  title: string;
  type: string;
  subtitle: string;
  image: string;
  userId: string;
  createdAt: string;
}

export type PostGroupProps = BaseCardProps & {
  name: string;
  posts: {
    id: string,
    title: string
  }[];
}

export type CardListProps<T> = {
  Card: React.ComponentType<T>,
  SkeletonCard: React.ComponentType,
  apiEndpoint: string,
  dataKey: string,
  isPosts?: boolean,
  selectFields?: string,
  orientation: "row" | "column",
  cardsPerPage?: number,
  handleEdit?: (id: string) => void,
  handleDelete?: (id: string) => void,
  searchBar?: boolean,
  pagination?: boolean,
  filterGroups?: FilterGroups;
  sortOptions?: Record<string, string>
};

export type FormFieldOption = {
  value: string | number;
  label: string;
};

export type FormField<T> = {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "select" | "file" | "files" | "url" | "number" | "radio" | "multi-select" | "date";
  placeholder?: string;
  options?: FormFieldOption[];
  accept?: string;
  rows?: number;
  minValue?: number;
  maxValue?: number;
  required?: boolean;
  unique?: boolean;
  existingValues?: any[];
  defaultValue?: FormFieldOption['value'];
  minLength?: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;
  minItems?: number;
  maxItems?: number;
  validation?: (formData: T, value: any) => string | undefined;
  disabled?: boolean;
};

export type FormProps<T> = {
  fields: FormField<T>[];
  state: T;
  setState: (state: T) => void | React.Dispatch<React.SetStateAction<T>>;
  submitEndpoint: string;
  error?: string;
  submitText?: string;
  loadingText?: string;
  toastMsg?: string;
  className?: string;
};

export type User = {
  id: string;
  name: string;
  uname: string;
  email: string;
  phone: {
    dialCode: string;
    number: string;
  } | null;
  role: "user" | "admin";
  verified: boolean;
};

export type Location = {
  district: string;
  taluk?: string;
  maagane?: string;
  village: string;
  lat: number | null;
  lng: number | null;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isRefreshing: boolean;
};

export type AuthAction =
  | { type: "LOGIN"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "REFRESH_START" }
  | { type: "REFRESH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "REFRESH_FAILED" };

export type AuthContextType = {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
};

export type DialogBoxOptions = {
  title: string;
  description?: string;
  severity?: "irreversible" | "risky" | "default";
  form?: FormProps;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export type DialogBoxContextType = {
  popup: (options: DialogBoxOptions) => void;
};

export type LoadingContextType = {
  startLoading: () => void;
  stopLoading: () => void;
};

export type DetailsType = PostDetailsType | CultureDetailsType | EventDetailsType | TagState | PostGroupState | PostTypeState | LocationDetailsType;

export type PostState = {
  details: PostDetailsType | null;
  content: string;
  location: Location | null;
};

export type EventState = {
  details: EventDetailsType | null;
  location: Location | null;
};

export type CultureState = {
  details: CultureDetailsType | null;
  content: string;
};

export type LocationState = {
  details: {
    name: string;
  },
  location: Location | null;
}

export type SignUpProps = {
  name: string;
  uname: string;
  email: string;
  phone?: {
    dialCode: string;
    number: string;
  } | string;
  password: string;
  confirmPassword: string;
};

export type LoginProps = {
  email: string;
  password: string;
};

export interface ICulture {
  id: string;
  title: string;
  description: string;
  coverImage: string | File | null;
  galleryImages: string[] | File[];
  files: string[] | File[],
  content: string;
  posts: number;
};

export type CultureDetailsType = Omit<ICulture, "id" | "content" | "posts">;

export interface ILocation {
  id: string;
  name: string;
  district: string;
  taluk: string;
  maagane: string;
  village: string;
  lat: number;
  lng: number;
  attachments: File[] | string[];
};

export interface IPost {
  id: string;
  title: string;
  shortTitle: string;
  culture: string;
  postGroup: string;
  postType: string;
  description: string;
  tags: string[];
  coverImage: string | File | null;
  files: string[] | File[];
  content: string;
  location?: ILocation;
};

export type PostDetailsType = Omit<IPost, "id" | "content" | "location"> & { locationSpecific: boolean }

export interface IEvent {
  title: string;
  description: string;
  duration: {
    start: Date | string | null,
    end: Date | string | null
  };
  culture: string;
  coverImage: string | File | null;
  files: string[] | File[];
  location: ILocation;
};

export type EventDetailsType = Omit<IEvent, "id" | "location">;
export type LocationDetailsType = {
  name: string;
};

export interface ITag {
  id: string;
  tag: string;
}

export interface IPostType {
  id: string;
  name: string;
}

export interface IPostGroup {
  id: string;
  name: string;
}

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiOptions extends Omit<RequestInit, "body" | "method"> {
  method?: Method;
  endpoint?: string;
  body?: any;
  auto?: boolean;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (opts?: Partial<ApiOptions>) => Promise<T | null>;
  post: (body: any, opts?: Partial<ApiOptions>) => Promise<T | null>;
  put: (body: any, opts?: Partial<ApiOptions>) => Promise<T | null>;
  patch: (body: any, opts?: Partial<ApiOptions>) => Promise<T | null>;
  del: (opts?: Partial<ApiOptions>) => Promise<T | null>;
  reset: () => void;
}

export type NewProps = {
  type: "post" | "event" | "culture" | "location" | "tag" | "post-type" | "post-group";
};

export type TagState = Omit<ITag, "id">;
export type PostGroupState = Omit<IPostGroup, "id">;
export type PostTypeState = Omit<IPostType, "id">;
export type NewState = PostState | CultureState | EventState | LocationState | TagState | PostGroupState | PostTypeState;

export type NewPostData = {
  titles: string[],
  shortTitles: string[],
  tags: FormFieldOption[],
  cultures: FormFieldOption[],
  postTypes: FormFieldOption[],
  postGroups: FormFieldOption[],
};

export type NewCultureData = {
  titles: string[]
}

export type NewEventData = {
  titles: string[],
  cultures: FormFieldOption[]
}

export type NewTagData = {
  tags: string[]
}

export type NewPostTypeData = {
  postTypes: string[]
}

export type NewPostGroupData = {
  postGroups: string[]
}

type NewDataMap = {
  post: NewPostData;
  culture: NewCultureData;
  event: NewEventData;
  location: {};
  tag: {
    tags: string[];
  };
  "post-group": {
    postGroups: string[];
  };
  "post-type": {
    postTypes: string[];
  };
};

type NewData<T extends NewProps["type"]> =
  NewDataMap[T] & {
    submitApi: ApiState<any>;
  };