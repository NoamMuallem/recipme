import React, { useState, useEffect } from "react";
import { type Tag } from "@prisma/client";
import { api } from "y/utils/api";
import { useDebounce } from "use-debounce";
import { Autocomplete } from "./autocomplete";

interface AsyncSelectProps {
  onSelect: (value: string | string[]) => void;
  isMulti?: boolean;
  freeSolo?: boolean;
}

const AsyncSelect = ({
  onSelect,
  isMulti = false,
  freeSolo = false,
}: AsyncSelectProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  const { data: tagsOptions, isLoading: isTagsOptionsLoading } =
    api.tags.suggestsTags.useQuery({
      searchString: debouncedInputValue,
    });

  useEffect(() => {
    if (tagsOptions) {
      setOptions(tagsOptions.map((option: Tag) => option.name));
    }
  }, [tagsOptions]);

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
