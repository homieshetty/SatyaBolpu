import React, { ChangeEvent, SubmitEvent, useEffect, useRef, useState } from "react";
import { FaUpload } from "react-icons/fa";
import Button from "./Button";
import { FormField, FormFieldOption, FormProps } from "../types/globals";
import { MdCancel } from "react-icons/md";
import { BASE_URL } from "../App";
import useApi from "../hooks/useApi";
import { toast } from "react-toastify";
import { cn } from "../utils/merge";

const Form = <T extends {}>({
  fields,
  state,
  setState,
  submitEndpoint,
  error,
  submitText = "Submit",
  toastMsg = "Saved successfully",
  loadingText = "Submitting",
  className = "",
}: FormProps<T>) => {

  const pageSize = 10;
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<T>(state);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allowedOptions, setAllowedOptions] = useState<Record<string, FormFieldOption[]>>({});
  const [activeOption, setActiveOption] = useState<Record<string, string>>({});
  const [activeIndex, setActiveIndex] = useState<Record<string, number>>({});
  const [visibleStart, setVisibleStart] = useState<Record<string, number>>({});
  const [showOptions, setShowOptions] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<boolean>(false);

  const textAreaRefs = useRef<Record<string, HTMLTextAreaElement>>({});
  const optionRefs = useRef<Record<string, HTMLInputElement>>({});

  const submitApi = typeof submitEndpoint === "string" ? useApi(submitEndpoint, { auto: false }) : submitEndpoint;
  const uploadSingleApi = useApi('/upload/single', { auto: false });
  const uploadMultipleApi = useApi('/upload/multiple', { auto: false });

  useEffect(() => {
    setFormData(state);
  }, [state]);

  useEffect(() => {
    Object.values(textAreaRefs.current).forEach(ref => {
      if (ref) {
        ref.style.height = "auto";
        ref.style.height = `${ref.scrollHeight}px`;
      }
    })
  }, [textAreaRefs.current]);

  const getValue = (
    obj: Record<string, any> | T,
    path: string
  ): any => {
    return path
      .split(".")
      .reduce((current, key) => (current as any)?.[key], obj);
  };

  const setValue = (
    obj: Record<string, any>,
    path: string,
    value: any
  ) => {
    const keys = path.split(".");

    const result = { ...obj };

    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...(current[keys[i]] ?? {}) };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setErrors(prev => setValue(prev, name, ""))
    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setFormData(prev => setValue(prev, name, file) as T);
    } else {
      if (type === "textarea") {
        const el = textAreaRefs.current[name];
        if (el) {
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }
      }
      setFormData(prev => setValue(prev, name, value) as T);
    }
  };

  useEffect(() => {
    if (!fields.length) return;
    let initialAllowed: Record<string, FormFieldOption[]> = {};

    fields.forEach(field => {
      if (field.type === "multi-select") {
        const selectedValues = getValue(formData, field.name) || [];
        const searchVal = getValue(activeOption, field.name) || "";

        initialAllowed = setValue(
          initialAllowed,
          field.name,
          (field.options ?? []).filter(opt =>
            !selectedValues.includes(opt.value) &&
            (!searchVal || opt.label?.toLowerCase().startsWith(searchVal.toLowerCase()))
          )
        );
      }
    });
    setAllowedOptions(initialAllowed);
  }, [fields, formData, activeOption]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    setErrors(prev => setValue(prev, name, ""))
    setFormData(
      prev =>
        setValue(
          prev,
          name,
          [
            ...((prev as any)[name] as File[] | string[]),
            ...Array.from(files)
          ]
        ) as T
    );

    setTimeout(() => e.target.value = "", 0);
  };

  const handleOptionChange = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    const { value } = e.target;
    setActiveOption(prev => setValue(prev, name, value));
    setActiveIndex(prev => setValue(prev, name, 0));
    setVisibleStart(prev => setValue(prev, name, 0));
  };

  const handleAddTag = (name: string, option: FormFieldOption) => {
    setErrors(prev => setValue(prev, name, ""))

    const currentSelection = getValue(formData, name) || [];
    if (!currentSelection.includes(option.value)) {
      setFormData(
        prev =>
          setValue(
            prev,
            name,
            [...(prev as any)[name], option.value]
          ) as T
      );
      setActiveOption(prev => setValue(prev, name, ""));

      if (optionRefs.current[name]) {
        optionRefs.current[name].value = "";
      }

      setActiveIndex(prev => setValue(prev, name, 0));
      setVisibleStart(prev => setValue(prev, name, 0));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, name: string) => {
    const options = getValue(allowedOptions, name);
    if (!options) return;
    const curIndex = getValue(activeIndex, name) ?? 0;
    const curStart = getValue(visibleStart, name) ?? 0;
    const total = options.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = (curIndex + 1) % total;
      setActiveIndex(prev => setValue(prev, name, newIndex));
      if (newIndex === 0) 
        setVisibleStart(prev => setValue(prev, name, 0));
      else if (newIndex >= curStart + pageSize)
        setVisibleStart(prev => setValue(prev, name, curStart + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = (curIndex - 1 + total) % total;
      setActiveIndex(prev => setValue(prev, name, newIndex));
      if (newIndex === total - 1)
        setVisibleStart(prev => setValue(prev, name, Math.max(0, total - pageSize)));
      else if (newIndex < curStart)
        setVisibleStart(prev => setValue(prev, name, curStart - 1));
    }
    if (e.key === "Enter" && options[curIndex]) {
      e.preventDefault();
      handleAddTag(name, options[curIndex]);
    }
  };

  const handleRemoveImage = (name: string, index: number) => {
    setFormData(
      prev =>
        setValue (
          prev,
          name,
          ((prev as any)[name] as File[] | string[]).filter((_, id) => id !== index)
        ) as T
    )
  }

  const handleRemoveOption = (name: string, index: number) => {
    setFormData(
      prev =>
        setValue(
          prev,
          name,
          (prev as any)[name].filter((_: any, id: number) => id !== index)
        ) as T
    );
  }

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const name = field.name;
      const value = getValue(formData, name);

      if (field.required && (!value || (typeof value === "string" && !value.trim()))) {
        newErrors = setValue(newErrors, name, `${field.label} is required.`);
        return;
      }

      if (field.type === "file" && !(value instanceof File) && typeof value !== "string") {
        newErrors = setValue(newErrors, name, `Uploaded attachment is not a file.`);
        return;
      }

      if (field.maxValue && (value > field.maxValue)) {
        newErrors = setValue(newErrors, name, `${field.label} cant be greater than ${field.maxValue}.`);
        return;
      }

      if (field.minValue && (value < field.minValue)) {
        newErrors = setValue(newErrors, name, `${field.label} should be greate than ${field.minValue}.`);
        return;
      }

      if (field.maxLength && (value.length > field.maxLength)) {
        newErrors = setValue(newErrors, name, `${field.label} can be at most ${field.maxLength} characters long.`);
        return;
      }

      if (field.minLength && (value.length < field.minLength)) {
        newErrors = setValue(newErrors, name, `${field.label} should be at least ${field.minLength} characters long.`);
        return;
      }

      if (field.maxWords && (value.split(" ").length > field.maxWords)) {
        newErrors = setValue(newErrors, name, `${field.label} can be at most ${field.maxWords} words long.`);
        return;
      }

      if (field.minWords && (value.split(" ").length < field.minWords)) {
        newErrors = setValue(newErrors, name, `${field.label} should be at least ${field.minWords} words long.`);
        return;
      }

      if (field.maxItems && (value.length > field.maxItems)) {
        newErrors = setValue(newErrors, name, `There can be at most ${field.maxItems} ${field.label}.`);
        return;
      }

      if (field.minItems && (value.length < field.minItems)) {
        newErrors = setValue(newErrors, name, `Add at least ${field.minItems} ${field.label}.`);
        return;
      }

      if(field.unique && field.existingValues && 
        field.existingValues.length > 0 && field.existingValues.includes(value)) {
        newErrors = setValue(newErrors, name, `${field.label} '${value}' already exists.`);
      }

      if (field.validation && value) {
        const validationError = field.validation(formData, value);
        if (validationError) {
          newErrors = setValue(newErrors, name, validationError);
        }
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    setSaving(true);
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      return;
    }

    const finalFormData = { ...formData };

    for (const field of fields) {
      if (field.type === "file") {
        const file = getValue(formData, field.name);
        if (file instanceof File) {
          const fd = new FormData();
          fd.append("file", file);
          const res = await uploadSingleApi.post(fd);
          (finalFormData as any)[field.name] = res.path;
        }
      }

      if (field.type === "files") {
        const files = getValue(formData, field.name)
        const finalFiles: string[] = [];
        const fd = new FormData();
        for (const file of files) {
          if (file instanceof File) {
            fd.append("files", file);
          } else {
            finalFiles.push(file);
          }
        }
        if (fd.has("files")) {
          const res = await uploadMultipleApi.post(fd);
          finalFiles.push(...res.paths);
        }
        (finalFormData as any)[field.name] = finalFiles;
      }
    }

    const res = await submitApi.post({ formData: finalFormData });
    if(!res) { setSaving(false); return; }
    toast.success(toastMsg);
    setState(res);
    setFormData(state);
    setErrors({});
    setSaving(false);
  };

  const renderField = (field: FormField) => {
    const fieldError = getValue(errors, field.name);
    const fieldValue = getValue(formData, field.name);

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="flex flex-col w-full gap-3">
            <label htmlFor={field.name} className="text-primary font-semibold text-[1.5rem]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              rows={field.rows || 4}
              value={fieldValue ?? ""}
              ref={(el) => {
                if (el)
                  textAreaRefs.current[field.name] = el;
              }}
              onChange={handleInputChange}
              className="text-black font-semibold p-2 bg-white overflow-hidden resize-none disabled:bg-gray-400"
              placeholder={field.placeholder}
              disabled={field.disabled}
            />
            {fieldError && (
              <p className="text-red-500">{fieldError}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="flex flex-col w-full gap-3">
            <label htmlFor={field.name} className="text-primary font-semibold text-[1.5rem]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={field.name}
              name={field.name}
              value={fieldValue ?? ""}
              onChange={handleInputChange}
              className="p-2 cursor-pointer disabled:bg-gray-300 bg-white"
              disabled={field.disabled}
            >
              <option value="" hidden className="text-white">
                {field.placeholder || `-- Choose ${field.label.toLowerCase()} --`}
              </option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError && (
              <p className="text-red-500">{fieldError}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="flex flex-col w-full gap-3">
            <label className="text-primary font-semibold text-[1.5rem]" htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              className={`text-black font-semibold p-2 cursor-pointer bg-white disabled:bg-gray-400`}
              type="date"
              id={field.name}
              name={field.name}
              value={fieldValue?.toString() ?? ""}
              onChange={handleInputChange}
            />
            {fieldError && <p className="text-red-500">{fieldError}</p>}
          </div>
        );

      case "file":
        const singleFileVal = fieldValue || null;
        return (
          <div key={field.name} className="flex flex-col w-full gap-3">
            <label className="text-primary font-semibold text-[1.5rem]" htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <label htmlFor={field.name} className="w-fit">
              <div className={`text-black w-fit p-5 rounded-lg flex flex-col items-center 
                justify-center border-3 border-solid border-primary  
                ${field.disabled ? "bg-white/70 cursor-not-allowed" : "bg-white hover:bg-white/70 cursor-pointer"}`}>
                <FaUpload />
                <p>Upload File</p>
              </div>
            </label>
            <input
              className="hidden"
              type="file"
              id={field.name}
              name={field.name}
              accept={field.accept ?? "*"}
              onChange={handleInputChange}
              disabled={field.disabled}
            />
            {singleFileVal && (
              <div className="w-1/2 border-2 border-solid border-white flex">
                <img
                  className="w-full aspect-square object-cover object-center"
                  src={singleFileVal instanceof File ? URL.createObjectURL(singleFileVal) : `${BASE_URL}${singleFileVal}`}
                  alt="Preview"
                />
              </div>
            )}
            {fieldError && (
              <p className="text-red-500">{fieldError}</p>
            )}
          </div>
        );

      case "files":
        return (
          <div key={field.name} className="flex flex-col w-full gap-3">
            <label className="text-primary font-semibold text-[1.5rem]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <label htmlFor={field.name} className="w-fit">
              <div className={`text-black w-fit p-5 rounded-lg flex flex-col items-center 
                justify-center border-3 border-solid border-primary  
                ${field.disabled ? "bg-white/70 cursor-not-allowed" : "bg-white hover:bg-white/70 cursor-pointer"}`}>
                <FaUpload />
                <p>Upload Files</p>
              </div>
            </label>
            <input
              className="hidden"
              type="file"
              accept={field.accept ?? "*"}
              id={field.name}
              name={field.name}
              multiple
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap text-white">
              {
                fieldValue.length > 0 && fieldValue.map((file: File | string, index: number) => {
                  const isFile = file instanceof File;
                  const fileUrl = isFile
                    ? URL.createObjectURL(file)
                    : file;

                  const fileType = isFile
                    ? file.type
                    : file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                      ? "image"
                      : "other";
                  return (
                    <div className="w-1/6 border-2 border-solid border-white flex relative" key={index}>
                      {
                        fileType.startsWith("image") ? (
                          <img
                            className="w-full aspect-square object-cover object-center"
                            src={`${BASE_URL}${fileUrl}`}
                            alt={`file-${index}`}
                          />
                        ) : (
                          <iframe
                            style={{
                              scrollbarWidth: "none"
                            }}
                            className="w-full aspect-square object-cover object-center"
                            src={`${BASE_URL}${fileUrl}`}
                          />
                        )
                      }
                      {
                        <MdCancel
                          className="absolute bg-black rounded-full top-2 right-2 cursor-pointer hover:text-primary"
                          onClick={() => handleRemoveImage(field.name, index)}
                        />
                      }
                    </div>
                  )
                })
              }
            </div>
            {fieldError && <p className="text-red-500">{fieldError}</p>}
          </div>
        )

      case "radio":
        const currentRadioValue = fieldValue !== undefined
          ? fieldValue
          : field.defaultValue;
        return (
          <div key={field.name} className="flex flex-col w-full gap-3">
            <label className="text-primary font-semibold text-[1.5rem]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            <div className="flex gap-10">
              {field.options?.map((option) => (
                <label key={option.value} className="text-white text-[1.5rem] cursor-pointer" htmlFor={`${field.name}-${option.value}`}>
                  <input
                    className="cursor-pointer"
                    type="radio"
                    id={`${field.name}-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={currentRadioValue === option.value || String(currentRadioValue) === String(option.value)}
                    onChange={handleInputChange}
                    disabled={field.disabled}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {fieldError && (
              <p className="text-red-500">{fieldError}</p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.name} className="flex flex-col w-full gap-3">
            <label htmlFor={field.name} className="text-primary font-semibold text-[1.5rem]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              id={field.name}
              name={field.name}
              value={fieldValue || ""}
              onChange={handleInputChange}
              className="text-black font-semibold p-2 disabled:bg-gray-400"
              placeholder={field.placeholder}
              disabled={field.disabled}
              min={field.minValue}
              max={field.maxValue}
            />
            {fieldError && (
              <p className="text-red-500">{fieldError}</p>
            )}
          </div>
        );

      case "multi-select":
        const curStart = getValue(visibleStart, field.name) ?? 0;
        const curActive = getValue(activeIndex, field.name) ?? 0;
        return (
          <div key={field.name} className="w-full relative flex flex-col gap-3">
            <label htmlFor={field.name} className="text-primary font-semibold text-[1.5rem]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="w-full flex gap-1 flex-wrap">
              {
                fieldValue.length > 0 && (fieldValue as (string | number)[]).map((option, index) => (
                  <div key={index} className="text-white max-w-full flex items-center justify-evenly gap-1 bg-gray-600 px-2 rounded-lg">
                    <p className="max-w-full wrap-break-word">{field.options?.find(opt => opt.value === option)?.label}</p>
                    {
                      <MdCancel
                        className="fill-gray-400 cursor-pointer hover:fill-white"
                        onClick={() => handleRemoveOption(field.name, index)} />
                    }
                  </div>
                ))
              }
            </div>
            <input
              className="text-black w-1/2 font-semibold bg-white p-2 overflow-hidden resize-none disabled:bg-gray-400"
              type="text"
              id={field.name}
              disabled={field.disabled}
              name={field.name}
              ref={(el) => {
                if (el)
                  optionRefs.current[field.name] = el;
              }}
              autoComplete="off"
              onKeyDown={(e) => handleKeyDown(e, field.name)}
              onFocus={() => setShowOptions(prev => setValue(prev, field.name, true))}
              onBlur={() => setShowOptions(prev => setValue(prev, field.name, false))}
              value={getValue(activeOption,field.name) ?? ""}
              onChange={(e) => handleOptionChange(e, field.name)}
            />
            <div
              className={`bg-white w-1/2 flex flex-col items-center justify-center absolute top-full z-10 
                ${getValue(showOptions, field.name) ? "visible" : "hidden"}`}
            >
              {getValue(allowedOptions, field.name)
                ?.slice(curStart, curStart + pageSize)
                .map((option: FormFieldOption, index: number) => {
                  const globalIndex = curStart + index;
                  return (
                    <div
                      key={globalIndex}
                      className={`w-full flex items-center justify-center cursor-pointer hover:bg-primary
                        ${globalIndex === curActive ? "bg-primary" : ""}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddTag(field.name, option)
                      }}
                    >
                      {option.label}
                    </div>
                  );
                })}
            </div>
          </div>
        )

      default:
        return (
          <div key={field.name} className="flex flex-col w-full gap-3">
            <label htmlFor={field.name} className="text-primary font-semibold text-[1.5rem]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={fieldValue || ""}
              onChange={handleInputChange}
              className={`text-black font-semibold bg-white p-2 disabled:bg-gray-400`}
              placeholder={field.placeholder}
              disabled={field.disabled}
            />
            {fieldError && (
              <p className="text-red-500">{fieldError}</p>
            )}
          </div>
        );
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn(
        "w-4/5 md:w-2/3 lg:w-1/2 flex flex-col gap-20 mx-auto py-10 justify-center", 
        className
      )}
    >
      {fields.map(field => (
        <div key={field.name}>
          {renderField(field)}
        </div>
      ))}

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      <Button
        content={submitText}
        loading={saving}
        loadingText={loadingText}
        type="submit"
        className="w-fit mx-auto"
      />
    </form>
  );
};

export default Form;