import { CardType } from '../components/CardList';
import { ReactNode } from 'react';
import { FilterGroups } from '../components/Filters';

export type Image = {
  src: string;
  alt: string;
};

export type ButtonProps = {
  content: ReactNode;
  className?: string;
  index?: number;
  ref?:
    | React.RefObject<HTMLButtonElement[]>
    | React.RefObject<HTMLButtonElement>;
  type?: 'submit' | 'reset' | 'button';
  onClick?: () => void;
  theme?: 'light' | 'dark';
  loading?: boolean;
  loadingText?: string;
};

export type BaseCardProps = {
  id: string;
  handleEdit?: (id: string) => {};
  handleDelete?: (id: string) => {};
};

export type PostGroupProps = BaseCardProps & {
  name: string;
  posts: {
    id: string;
    title: string;
  }[];
};

export type CardListProps<T> = {
  Card: React.ComponentType<T>;
  SkeletonCard: React.ComponentType;
  apiEndpoint: string;
  dataKey: string;
  isPosts?: boolean;
  selectFields?: string;
  orientation: 'row' | 'column';
  cardsPerPage?: number;
  handleEdit?: (id: string) => void;
  handleDelete?: (id: string) => void;
  searchBar?: boolean;
  pagination?: boolean;
  filterGroups?: FilterGroups;
  sortOptions?: Record<string, string>;
};

export type FormFieldOption = {
  value: string | number;
  label: string;
};

export type FormField = {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'file'
    | 'files'
    | 'url'
    | 'number'
    | 'radio'
    | 'multi-select'
    | 'date';
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
  validation?: (formData: any, value: any) => string | undefined;
  disabled?: boolean;
  renderCondition?: (formData: any) => boolean;
};

export type FormProps<T> = {
  fields: FormField[];
  state: T;
  setState?: (
    state: T,
  ) => void | React.Dispatch<React.SetStateAction<OtherState>>;
  submitEndpoint: string | ApiState<any>;
  onSubmit?: (
    formData: T,
    setFormData: React.Dispatch<React.SetStateAction<T>>,
    res: any,
  ) => void;
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
  role: 'user' | 'admin';
  image: string;
  verified: boolean;
};

export type Location = Omit<ILocation, 'id' | 'name' | 'attachments'>;

export type AuthState = {
  user: User | null;
  token: string | null;
  isRefreshing: boolean;
};

export type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REFRESH_FAILED' };

export type AuthContextType = {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
};

export type DialogBoxOptions = {
  title: string;
  description?: string;
  severity?: 'irreversible' | 'risky' | 'default';
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

export type DetailsType =
  | PostDetailsType
  | CultureDetailsType
  | EventState
  | OtherState
  | LocationDetailsType;

export type PostState = {
  details: PostDetailsType | null;
  content: string;
  location?: string | ILocation | null;
};

export type EventState = Omit<IEvent, 'id' | 'location'> & { location: string };

export type CultureState = {
  details: CultureDetailsType | null;
  content: string;
};

export type LocationState = {
  details: {
    name: string;
  };
  location: Location | null;
};

export type SignUpProps = {
  name: string;
  uname: string;
  email: string;
  phone?:
    | {
        dialCode: string;
        number: string;
      }
    | string;
  image?: File | string;
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
  files: string[] | File[];
  content: string;
  posts: number;
}

export type CultureDetailsType = Omit<ICulture, 'id' | 'content' | 'posts'>;

export interface ILocation {
  id: string;
  name: string;
  district: string;
  taluk: string;
  maagane: string;
  village: string;
  coordinates: number[2];
  attachments: File[] | string[];
}

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
}

export type PostDetailsType = Omit<IPost, 'id' | 'content'> & {
  locationSpecific: boolean;
  location?: string;
};

export interface IEvent {
  id: string;
  title: string;
  description: string;
  duration: {
    start: Date | string | null;
    end: Date | string | null;
  };
  culture: string;
  coverImage: string | File | null;
  files: string[] | File[];
  location: ILocation;
}

export type LocationDetailsType = Pick<
  ILocation,
  'id' | 'name' | 'attachments'
>;

export interface IOther {
  id: string;
  name: string;
}

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiOptions extends Omit<RequestInit, 'body' | 'method'> {
  method?: Method;
  globalLoad?: boolean;
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

export type NewType =
  | 'post'
  | 'culture'
  | 'event'
  | 'blog'
  | 'tag'
  | 'post-type'
  | 'location'
  | 'post-group';

export type OtherState = Omit<IOther, 'id'>;
export type NewState =
  | PostState
  | CultureState
  | EventState
  | LocationState
  | OtherState;

export type NewPostData = {
  titles: string[];
  shortTitles: string[];
  tags: FormFieldOption[];
  cultures: FormFieldOption[];
  postTypes: FormFieldOption[];
  postGroups: FormFieldOption[];
  locations: FormFieldOption[];
};

export type NewCultureData = {
  titles: string[];
};

export type NewEventData = {
  titles: string[];
  cultures: FormFieldOption[];
  locations: FormFieldOption[];
};

export type NewTagData = {
  tags: string[];
};

export type NewPostTypeData = {
  postTypes: string[];
};

export type NewPostGroupData = {
  postGroups: string[];
};

type NewDataMap = {
  post: NewPostData;
  culture: NewCultureData;
  event: NewEventData;
  location: {};
  tag: {
    tags: string[];
  };
  'post-group': {
    postGroups: string[];
  };
  'post-type': {
    postTypes: string[];
  };
};

export type NewData<T extends NewType> = NewDataMap[T] & {
  submitApi: ApiState<any>;
};

export type MapProps = {
  minimal?: boolean;
  children?: ReactNode;
  ref?: React.RefObject<HTMLDivElement | null>;
  editMode?: boolean;
  state?: PostState | EventState | LocationState;
  setState?: React.Dispatch<
    React.SetStateAction<EventState | PostState | LocationState>
  >;
};
