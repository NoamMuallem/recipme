import React, { useState } from "react";

type Option = {
  value: string;
  label: string;
};

interface AutocompleteProps {
  options: Option[];
  placeholder?: string;
  onSelect: (selectedOptions: Option[]) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  placeholder,
  onSelect,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [suggestions, setSuggestions] = useState<Option[]>([]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (e.target.value) {
      const filteredSuggestions = options.filter((option) =>
        option.label.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const onOptionClick = (option: Option) => {
    setSelectedOptions((prevSelected) => [...prevSelected, option]);
    setSuggestions([]);
    setInputValue("");
    onSelect([...selectedOptions, option]);
  };

  const onRemoveOption = (option: Option) => {
    const newSelectedOptions = selectedOptions.filter(
      (selectedOption) => selectedOption.value !== option.value
    );
    setSelectedOptions(newSelectedOptions);
    onSelect(newSelectedOptions);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap">
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className="badge-info badge m-1"
            onClick={() => onRemoveOption(option)}
          >
            {option.label}
          </span>
        ))}
      </div>
      <input
        type="text"
        className="input-bordered input w-full"
        placeholder={placeholder || "Type to search..."}
        value={inputValue}
        onChange={onInputChange}
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-700 shadow">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.value}
              className="cursor-pointer p-1 hover:bg-gray-200"
              onClick={() => onOptionClick(suggestion)}
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
