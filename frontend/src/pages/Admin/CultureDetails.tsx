import { ChangeEvent, SubmitEvent, useEffect, useRef, useState } from "react";
import Title from "../../components/Title";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaUpload } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import Button from "../../components/Button";
import { toast } from "react-toastify";
import useApi from "../../hooks/useApi";
import { ICulture } from "../../types/globals";
import { BASE_URL } from "../../App";
import { validateCultureDetails } from "../../utils/validate";

type CultureDetailsType = Omit<ICulture, "content" | "posts">;

type FormErrorType = {
  [k in keyof CultureDetailsType]: string
};

const initialFormData: CultureDetailsType = {
  title: "",
  descriptiveName: "",
  description: "",
  coverImage: null,
  galleryImages: [],
  files: []
};

const initialFormErrors: FormErrorType = {
  title: "",
  descriptiveName: "",
  description: "",
  coverImage: "",
  galleryImages: "",
  files: ""
};

const CultureDetails = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState<CultureDetailsType>(initialFormData);
  const [errors, setErrors] = useState<FormErrorType>(initialFormErrors);
  const [submitted, setSubmitted] = useState(false);
  const [existingCultures, setExistingCultures] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  const uploadSingleApi = useApi("/upload/single", { auto: false });
  const uploadMultipleApi = useApi("/upload/multiple", { auto: false });
  const culturesApi = useApi("/cultures", { auto: false });
  const draftsApi = useApi("/drafts", { auto: false });
  const { state: authState } = useAuth();
  const navigate = useNavigate();

  const descrRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const fetchCultures = async () => {
      const res = await culturesApi.refetch({ endpoint: "/cultures", method: "GET" });
      if (!res) return;
      if (res && res?.cultures?.length > 0) {
        setExistingCultures(res.cultures.map((c: ICulture) => c.title));
      }
    }

    fetchCultures();
  }, []);

  useEffect(() => {
    if (culturesApi.error) {
      toast.error(culturesApi.error);
      console.error(culturesApi.error);
    }

    if (draftsApi.error) {
      toast.error(draftsApi.error);
      console.error(draftsApi.error);
    }

    if (uploadMultipleApi.error) {
      toast.error(uploadMultipleApi.error);
      console.error(uploadMultipleApi.error);
    }

    if (uploadSingleApi.error) {
      toast.error(uploadSingleApi.error);
      console.error(uploadSingleApi.error);
    }

  }, [culturesApi.error, draftsApi.error, uploadMultipleApi.error, uploadSingleApi.error]);

  useEffect(() => {
    const fetchDraft = async () => {
      const res = await draftsApi.refetch({ endpoint: `/drafts/${id}`, method: "GET" });
      if (!res) return;
      if (res.draft) {
        setFormData(res.draft.details);
        if (validateCultureDetails(res.draft.details)) {
          setSubmitted(true);
        }
      } else
        toast.error("Failed to fetch draft.");
    }

    fetchDraft();
  }, [id]);

  useEffect(() => {
    const el = descrRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [formData.description]);

  useEffect(() => {
    return () => {
      if (formData.coverImage instanceof File) URL.revokeObjectURL(URL.createObjectURL(formData.coverImage));
      if (formData.galleryImages.length > 0) {
        formData.galleryImages.forEach((file) => {
          if (file instanceof File) URL.revokeObjectURL(URL.createObjectURL(file));
        });
      }
    };
  }, [formData.coverImage, formData.galleryImages]);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: name === "coverImage" ? files[0] : [
        ...(prev[name as keyof CultureDetailsType] as File[]),
        ...Array.from(files)
      ]
    }));

    setTimeout(() => e.target.value = "", 0);
  };

  const handleRemoveImage = (key: keyof CultureDetailsType, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: (prev[key] as File[]).filter((_, id) => id !== index)
    }))
  }

  const handleFormSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    setSaving(true);
    e.preventDefault();
    const newErrors: FormErrorType = {
      title: "",
      descriptiveName: "",
      description: "",
      coverImage: "",
      galleryImages: "",
      files: ""
    };

    if (!formData.title.trim()) {
      newErrors.title = "Culture name is required.";
    }

    if (formData.title && formData.title.length < 5) {
      newErrors.title = "Culture name should be atleast 5 characters long.";
    }

    if (existingCultures.length > 0 && existingCultures.some(c => c.toLowerCase() === formData.title.toLowerCase())) {
      newErrors.title = "A Culture with this name already exists.";
      setErrors(newErrors);
      setSaving(false);
      return;
    }

    if (!formData.descriptiveName.trim()) {
      newErrors.descriptiveName = "Descriptive name is required.";
    }

    if (formData.descriptiveName && formData.descriptiveName.length < 5) {
      newErrors.descriptiveName = "Descriptive name should be atleast 5 characters long.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (formData.description && formData.description.split(" ").length < 100) {
      newErrors.description = "Description should be atleast 100 words long.";
    }

    if (!formData.coverImage) {
      newErrors.coverImage = "A Cover image is required.";
    }

    formData.galleryImages.filter((f): f is File => f !== null);
    if (formData.galleryImages.length < 15) {
      newErrors.galleryImages = "Atleast 15 gallery images are required.";
    }

    formData.files.filter((f): f is File => f !== null);

    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(err => err !== "");
    if (hasErrors) {
      setSaving(false)
      return;
    }

    let coverImage = formData.coverImage;
    if(formData.coverImage instanceof File) {
      const coverImageData = new FormData();
      coverImageData.append('file', formData.coverImage);
      const res = await uploadSingleApi.post(coverImageData);
      coverImage = res.path;
    }

    let galleryImages = [];
    const galleryImagesData = new FormData();

    formData.galleryImages.forEach(file => {
      file instanceof File ?
        galleryImagesData.append("files", file as File) :
        galleryImages.push(file)
    });

    if (galleryImagesData.getAll("files").length > 0) {
      const res2 = await uploadMultipleApi.post(galleryImagesData);
      if (!res2) {
        setSaving(false);
        return;
      }
      galleryImages.push(...res2.paths);
    }

    const details = {
      ...formData,
      coverImage,
      galleryImages
    };
    const res = await culturesApi.refetch({ endpoint: `/cultures/draft/${id}/details`, method: "POST", body: { details } });
    if (!res) {
      setSaving(false);
      return
    };

    setSubmitted(true);
    setSaving(false);
  };

  const handleEditAgain = async () => {
    setSubmitted(false);
    await culturesApi.refetch({ endpoint: `/cultures/draft/${id}/details`, method: "DELETE" });
  }

  const handleNext = () => {
    if (submitted) {
      navigate(`/add/culture/${id}/editor`)
    } else {
      toast.error("You need to submit the form first!");
    }
  }

  if (!authState.token || authState.user?.role !== "admin") {
    return <Navigate to={"/404"} replace />
  }

  return (
    <div className="w-full">
      <div className="my-20">
        <Title title="New Culture" />
      </div>

      <form
        className="flex w-3/4 md:w-1/2 flex-col gap-10 items-center justify-center mx-auto my-20"
        onSubmit={handleFormSubmit}
      >
        <div className="flex flex-col w-full gap-3">
          <label className="text-primary font-semibold text-[1.5rem]" htmlFor="title">
            Name
          </label>
          <input
            className={`text-black font-semibold p-2 bg-white disabled:bg-gray-400`}
            type="text"
            id="title"
            disabled={submitted}
            name="title"
            value={formData.title}
            onChange={handleFormChange}
          />
          {errors.title && <p className="text-red-500">{errors.title}</p>}
        </div>

        <div className="flex flex-col w-full gap-3">
          <label className="text-primary font-semibold text-[1.5rem]" htmlFor="descriptiveName">
            Descriptive Name
          </label>
          <input
            className={`text-black bg-white font-semibold p-2 disabled:bg-gray-400`}
            disabled={submitted}
            type="text"
            id="descriptiveName"
            name="descriptiveName"
            value={formData.descriptiveName}
            onChange={handleFormChange}
          />
          {errors.descriptiveName && <p className="text-red-500">{errors.descriptiveName}</p>}
        </div>

        <div className="flex flex-col w-full gap-3">
          <label className="text-primary font-semibold text-[1.5rem]" htmlFor="description">
            Description
          </label>
          <textarea
            className={`text-black bg-white font-semibold p-2 disabled:bg-gray-400 resize-none`}
            rows={1}
            disabled={submitted}
            id="description"
            name="description"
            ref={descrRef}
            value={formData.description}
            onChange={handleFormChange}
          />
          {errors.description && <p className="text-red-500">{errors.description}</p>}
        </div>

        <div className="flex flex-col w-full gap-3">
          <label className="text-primary font-semibold text-[1.5rem]">
            Cover Image
          </label>
          <label htmlFor="coverImage" className="w-fit">
            <div className={`text-black w-fit p-5 rounded-lg flex flex-col items-center 
              justify-center border-3 border-solid border-primary  
              ${submitted || formData.coverImage ?
                "bg-white/70 cursor-not-allowed" : "bg-white hover:bg-white/70 cursor-pointer"}`}>
              <FaUpload />
              <p>Upload Image</p>
            </div>
          </label>
          <input
            className="hidden"
            disabled={submitted || !!formData.coverImage}
            type="file"
            accept="image/*"
            id="coverImage"
            name="coverImage"
            multiple
            onChange={handleFileChange}
          />
          <div className="flex flex-wrap text-white">
            {
              formData.coverImage && 
                  <div className="w-1/2 border-2 border-solid border-white flex relative">
                    <img
                      className="w-full aspect-square object-cover object-center"
                      src={formData.coverImage instanceof File ? URL.createObjectURL(formData.coverImage) : `${BASE_URL}${formData.coverImage}`} alt="cover-image" />
                    {
                      !submitted &&
                      <MdCancel
                        className="absolute bg-black rounded-full text-[1.5rem] top-2 right-2 cursor-pointer hover:text-primary"
                        onClick={() => setFormData(prev => ({ ...prev, "coverImage": "" }))}
                      />
                    }
                  </div>
            }
          </div>
          {errors.coverImage && <p className="text-red-500">{errors.coverImage}</p>}
        </div>

        <div className="flex flex-col w-full gap-3">
          <label className="text-primary font-semibold text-[1.5rem]">
            Gallery Images
          </label>
          <label htmlFor="galleryImages" className="w-fit">
            <div className={`text-black w-fit p-5 rounded-lg flex flex-col items-center 
              justify-center border-3 border-solid border-primary  
              ${submitted ? "bg-white/70 cursor-not-allowed" : "bg-white hover:bg-white/70 cursor-pointer"}`}>
              <FaUpload />
              <p>Upload Images</p>
            </div>
          </label>
          <input
            className="hidden"
            disabled={submitted}
            type="file"
            accept="image/*"
            id="galleryImages"
            name="galleryImages"
            multiple
            onChange={handleFileChange}
          />
          <div className="flex flex-wrap text-white">
            {
              formData.galleryImages.length > 0 && formData.galleryImages.map((galleryImage, index) => {
                return (
                  <div className="w-1/6 border-2 border-solid border-white flex relative" key={index}>
                    <img
                      className="w-full aspect-square object-cover object-center"
                      src={galleryImage instanceof File ? URL.createObjectURL(galleryImage) : `${BASE_URL}${galleryImage}`} alt={`gallery-${index}`} />
                    {
                      !submitted &&
                      <MdCancel
                        className="absolute bg-black rounded-full top-2 right-2 cursor-pointer hover:text-primary"
                        onClick={() => handleRemoveImage("galleryImages", index)}
                      />
                    }
                  </div>
                )
              })
            }
          </div>
          {errors.galleryImages && <p className="text-red-500">{errors.galleryImages}</p>}
        </div>

        <div className="flex flex-col w-full gap-3">
          <label className="text-primary font-semibold text-[1.5rem]">
            Other related files
          </label>
          <label htmlFor="files" className="w-fit">
            <div className={`text-black w-fit p-5 rounded-lg flex flex-col items-center 
              justify-center border-3 border-solid border-primary  
              ${submitted ? "bg-white/70 cursor-not-allowed" : "bg-white hover:bg-white/70 cursor-pointer"}`}>
              <FaUpload />
              <p>Upload Files</p>
            </div>
          </label>
          <input
            className="hidden"
            disabled={submitted}
            type="file"
            accept="image/*"
            id="files"
            name="files"
            multiple
            onChange={handleFileChange}
          />
          <div className="flex flex-wrap text-white">
            {
              formData.files.length > 0 && formData.files.map((file, index) => {
                return (
                  <div className="w-1/6 border-2 border-solid border-white flex relative" key={index}>
                    <img
                      className="w-full aspect-square object-cover object-center"
                      src={file instanceof File ? URL.createObjectURL(file) : `${BASE_URL}${file}`} alt={`gallery-${index}`} />
                    {
                      !submitted &&
                      <MdCancel
                        className="absolute bg-black rounded-full top-2 right-2 cursor-pointer hover:text-primary"
                        onClick={() => handleRemoveImage("files", index)}
                      />
                    }
                  </div>
                )
              })
            }
          </div>
          {errors.files && <p className="text-red-500">{errors.files}</p>}
        </div>

        {

          submitted ?
            <FaEdit
              className={`text-[2.5rem] cursor-pointer m-5 bg-black 
                         text-white hover:scale-110 hover:text-primary z-50`}
              id="edit"
              onClick={handleEditAgain} />
            :
            <Button
              content="Save"
              className="text-[1.5rem] mx-auto"
              type="submit"
              loading={saving}
              loadingText="Saving"
            />
        }

      </form>

      <div className="flex w-screen items-center justify-between p-10">
        <div
          className={`text-[1.2rem] sm:text-[1.75rem] hover:text-primary text-white cursor-pointer`}
          onClick={() => navigate(`/add/culture/${id}`)}>
          {`< Progress`}
        </div>
        <div
          className={`text-[1.2rem] sm:text-[1.75rem]
          ${submitted ? "hover:text-primary text-white cursor-pointer" : "text-gray-500 cursor-not-allowed"}`}
          onClick={handleNext}>
          {`Editor >`}
        </div>
      </div>

    </div>
  )
}

export default CultureDetails;
