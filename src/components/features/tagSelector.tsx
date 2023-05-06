import React, { useState, useEffect } from "react";
import { type Tag } from "@prisma/client";
import { api } from "y/utils/api";
import { useDebounce } from "use-debounce";
import { Autocomplete } from "../base/autocomplete";

interface AsyncSelectProps {
  onSelect: (value: string | string[]) => void;
  isMulti?: boolean;
  freeSolo?: boolean;
  optionsToHide?: string[];
  externalValue?: string;
}

const AsyncSelect = ({
  onSelect,
  isMulti = false,
  freeSolo = false,
  optionsToHide = [],
  externalValue,
}: AsyncSelectProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  const { data: tagsOptions, isLoading: isTagsOptionsLoading } =
    api.tags.suggestsTags.useQuery({
      searchString: debouncedInputValue,
    });

  useEffect(() => {
    if (!externalValue) return;
    setInputValue(externalValue);
  }, [externalValue]);

  useEffect(() => {
    if (tagsOptions) {
      const allOptions = tagsOptions.map((option: Tag) => option.name);

      const shouldShowOption = (option: string) =>
        !optionsToHide.includes(option);

      const optionsToShow = allOptions.filter(shouldShowOption);

      setOptions(optionsToShow);
    }
  }, [tagsOptions, optionsToHide]);

  return (
    <Autocomplete
      inputValue={inputValue}
      setInputValue={(value) => setInputValue(value)}
      onSelect={onSelect}
      options={options}
      freeSolo={freeSolo}
      isMulti={isMulti}
      isOptionsLoading={isTagsOptionsLoading}
    />
  );
};

export default AsyncSelect;
