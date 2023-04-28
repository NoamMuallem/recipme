import { type IngredientsName } from "@prisma/client";
import React, { useState, useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { api } from "y/utils/api";
import Spinner from "./spinner";
import { NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD } from "y/constants";
import Autocomplete from "./autocomplete";
import { Units } from "y/index.d";

interface IngredientNameProps {
  onSelect: (name: string | string[]) => void;
  isMulti?: boolean;
  freeSolo?: boolean;
}

export const IngredientNameAutocomplete = ({
  onSelect,
  isMulti = false,
  freeSolo = false,
}: IngredientNameProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  const { data: ingredientsOptions, isLoading: isTagsLoading } =
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
    if (ingredientsOptions) {
      setOptions(
        ingredientsOptions.map((option: IngredientsName) => option.name)
      );
    }
  }, [ingredientsOptions]);

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
                onSelect(inputValue);
              }
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
      </div>
    </div>
  );
};
interface IngredientAutocompleteProps {
  onSelect: (name: string, amount: number, unit: Units) => void;
  initialAmount: number;
  initialUnit: Units;
}

const IngredientsInput = ({
  onSelect,
  initialAmount,
  initialUnit,
}: IngredientAutocompleteProps) => {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [unit, setUnit] = useState<Units>(initialUnit);
  const [name, setName] = useState<string>("");

  const unitOptions = Object.values(Units).map((unit) => ({
    value: unit,
    label: unit,
  }));

  return (
    <div className="align-center flex">
      <input
        type="number"
        className="input-bordered input mr-2"
        placeholder="Amount"
        value={amount}
        onChange={(e) => {
          setAmount(Number(e.target.value));
          onSelect(name, Number(e.target.value), unit);
        }}
      />
      <div className="ml-2">
        <Autocomplete
          options={unitOptions}
          placeholder="Select unit..."
          onSelect={(selectedOptions) => {
            if (selectedOptions.length > 0 && selectedOptions[0]?.value) {
              const selectedUnit = selectedOptions[0].value as Units;
              setUnit(selectedUnit);
              onSelect(name, amount, selectedUnit);
            }
          }}
        />
      </div>
      <IngredientNameAutocomplete
        freeSolo
        onSelect={(selectedName: string | string[]) => {
          console.log("entered");
          if (!Array.isArray(selectedName)) {
            setName(selectedName);
            console.log({ selectedName });
            onSelect(selectedName, amount, unit);
          }
        }}
      />
    </div>
  );
};

export default IngredientsInput;
