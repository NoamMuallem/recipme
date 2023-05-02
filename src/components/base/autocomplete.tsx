import { useMemo, useState } from "react";
import Spinner from "./spinner";

interface AutocompleteProps {
  onSelect: (name: string | string[]) => void;
  isMulti?: boolean;
  freeSolo?: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  options: string[];
  isOptionsLoading?: boolean;
}

export const Autocomplete = ({
  onSelect,
  inputValue,
  setInputValue,
  options,
  isOptionsLoading,
  isMulti = false,
  freeSolo = false,
}: AutocompleteProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      <div className={`${isMulti ? "mt-2" : ""} flex`}>
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
              if (freeSolo && value.length > 0 && !options.includes(value)) {
                onSelect(value);
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && relevantOptions.length > 0 && (
            <div className="z-100 absolute left-0 z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
              <ul className="max-h-48 overflow-auto">
                {isOptionsLoading ? (
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
      </div>
    </div>
  );
};
