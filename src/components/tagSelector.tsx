import React, { useState, useEffect, useMemo } from "react";
import Spinner from "./spinner";
import { type Tag } from "@prisma/client";
import { api } from "y/utils/api";
import { useDebounce } from "use-debounce";

interface AsyncSelectProps {
  onSelect: (value: string | string[]) => void;
  isMulti?: boolean;
}

const AsyncSelect = ({ onSelect, isMulti = false }: AsyncSelectProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  const { data: tagsOptions, isLoading: isTagsLoading } =
    api.tags.suggestsTags.useQuery({
      text: debouncedInputValue,
    });

  useEffect(() => {
    if (tagsOptions) {
      setOptions(tagsOptions.map((option: Tag) => option.name));
    }
  }, [tagsOptions]);

  const handleSelect = (value: string) => {
    if (isMulti) {
      setInputValue("");
      const newSelectedValues = new Set(selectedItems);
      newSelectedValues.add(value);
      setSelectedItems([...newSelectedValues]);
      onSelect(Array.from(newSelectedValues));
    } else {
      setSelectedItems([value]);
      setInputValue(value);
      onSelect(value);
    }
  };

  const handleRemoveItem = (value: string) => {
    const newSelectedValues = new Set(selectedItems);
    newSelectedValues.delete(value);
    setSelectedItems([...newSelectedValues]);
    onSelect(Array.from(newSelectedValues));
  };

  const relevantOptions = useMemo(() => {
    return options.filter((option) => !selectedItems.includes(option));
  }, [options, selectedItems]);

  return (
    <div className="flex flex-col">
      {isMulti && (
        <div className="flex flex-wrap">
          {selectedItems.map((item, index) => (
            <div
              key={index}
              className="mr-2 mb-2 flex items-center rounded bg-gray-200 px-2 py-1 text-sm"
            >
              <span>{item}</span>
              <button
                className="ml-2 text-xs font-bold text-gray-600 hover:text-red-600"
                onClick={() => handleRemoveItem(item)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2 flex">
        <div className="relative">
          <input
            type="text"
            className="input-bordered input w-full"
            placeholder="Search"
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value;
              //remove option if the input does not match
              if (!isMulti && !options.includes(value)) {
                setSelectedItems([]);
              }
              setInputValue(value);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && relevantOptions.length > 0 && (
            <div className="absolute left-0 z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
              <ul className="max-h-48 overflow-auto">
                {isTagsLoading ? (
                  <Spinner />
                ) : (
                  relevantOptions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-200"
                      onClick={() => handleSelect(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
        {!isMulti && (
          <button
            type="button"
            className="btn-primary btn ml-2"
            onClick={() => handleSelect(inputValue)}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default AsyncSelect;
