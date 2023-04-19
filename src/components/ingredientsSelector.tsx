import { type IngredientsName } from "@prisma/client";
import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { api } from "y/utils/api";
import Spinner from "./spinner";
import { NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD } from "y/constants";

interface IngredientAutocompleteProps {
  onSelect: (name: string, amount: number) => void;
  initialAmount: number;
}

const IngredientAutocomplete: React.FC<IngredientAutocompleteProps> = ({
  onSelect,
  initialAmount,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedInputValue] = useDebounce(inputValue, 300);
  const [amount, setAmount] = useState(initialAmount);

  const { data: IngredientsOptions, isLoading: isIngredientsLoading } =
    api.ingredients.suggestIngredients.useQuery(
      {
        text: debouncedInputValue,
      },
      {
        enabled:
          debouncedInputValue.length >
          NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD,
      }
    );

  useEffect(() => {
    if (IngredientsOptions) {
      setOptions(
        IngredientsOptions.map((option: IngredientsName) => option.name)
      );
    }
  }, [IngredientsOptions]);

  const handleSelect = (value: string, amount: number) => {
    setInputValue(value);
    setOptions([]);
    setShowSuggestions(false);
    onSelect(value, amount);
  };

  return (
    <div className="flex">
      <input
        type="number"
        className="input-bordered input mr-2"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <div className="relative">
        <input
          type="text"
          className="input-bordered input w-full"
          placeholder="Search ingredients"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions &&
          options.length > 0 &&
          inputValue.length >
            NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD && (
            <div className="absolute left-0 z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
              <ul className="max-h-48 overflow-auto">
                {isIngredientsLoading ? (
                  <Spinner />
                ) : (
                  options.map((suggestion, index) => (
                    <li
                      key={index}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-200"
                      onClick={() => handleSelect(suggestion, amount)}
                    >
                      {suggestion}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
      </div>
      <button
        type="button"
        className="btn-primary btn ml-2"
        onClick={() => handleSelect(inputValue, amount)}
      >
        Add
      </button>
    </div>
  );
};

export default IngredientAutocomplete;
