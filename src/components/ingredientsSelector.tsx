import React, { useState, useEffect } from "react";
import Spinner from "./spinner";
import { type IngredientsName } from "@prisma/client";
import { api } from "y/utils/api";
import { useDebounce } from "use-debounce";

interface IngredientSelectorProp {
  onSelect: (value: string) => void;
}

// NOTE: I tried to make this component more generic but because the query (for the typeahead) needs the raw input
// I hade to put the query inside and so the generic autocomplete became the IngredientsSelector
// because in the new recipe page there are multiple dynamic instances of this component I could not take the input state out
const IngredientSelector = ({ onSelect }: IngredientSelectorProp) => {
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  // added debounce to prevent sending requests for nothing to the server
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  const { data: ingredientsOptions, isLoading: isIngredientsLoading } =
    api.ingredients.suggestIngredients.useQuery({
      text: debouncedInputValue,
    });

  useEffect(() => {
    if (ingredientsOptions) {
      setOptions(
        ingredientsOptions.map((option: IngredientsName) => option.name)
      );
    }
  }, [ingredientsOptions]);

  const handleSelect = (value: string) => {
    setInputValue(value);
    setOptions([]);
    setShowSuggestions(false);
    onSelect(value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="input-bordered input w-full"
        placeholder="Search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && options.length > 0 && (
        <div className="absolute left-0 z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <ul className="max-h-48 overflow-auto">
            {isIngredientsLoading ? (
              <Spinner />
            ) : (
              options.map((suggestion, index) => (
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
  );
};

export default IngredientSelector;
