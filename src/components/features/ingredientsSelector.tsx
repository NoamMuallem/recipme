import { type IngredientsName } from "@prisma/client";
import React, { useState, useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { api } from "y/utils/api";
import { NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD } from "y/constants";
import { Units } from "y/index.d";
import { Autocomplete } from "../base/autocomplete";

interface IngredientNameProps {
  onSelect: (name: string | string[]) => void;
  freeSolo?: boolean;
  isMulti?: boolean;
}

export const IngredientNameAutocomplete = ({
  onSelect,
  freeSolo = false,
  isMulti = false,
}: IngredientNameProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  const { data: ingredientsOptions, isLoading: isIngredientsOptionsLoading } =
    api.ingredients.suggestIngredients.useQuery(
      {
        searchString: debouncedInputValue,
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

  //if the input length is lower then minimum hide all options
  useEffect(() => {
    if (
      inputValue.length <= NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD
    ) {
      setOptions([]);
    }
  }, [inputValue.length]);

  return (
    <Autocomplete
      inputValue={inputValue}
      setInputValue={(value) => setInputValue(value)}
      onSelect={onSelect}
      options={options}
      freeSolo={freeSolo}
      isMulti={isMulti}
      isOptionsLoading={
        isIngredientsOptionsLoading &&
        inputValue.length >
          NUMBER_OF_CHARACTERS_NEEDED_FOR_INGREDIENTS_TYPEAHEAD
      }
    />
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

  const unitOptions = Object.values(Units);

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
          inputValue={unit}
          setInputValue={(value) => setUnit(value as Units)}
          options={unitOptions}
          onSelect={(selectedOptions) => {
            if (selectedOptions.length > 0 && selectedOptions[0]) {
              const selectedUnit = selectedOptions[0] as Units;
              setUnit(selectedUnit);
              onSelect(name, amount, selectedUnit);
            }
          }}
        />
      </div>
      <IngredientNameAutocomplete
        freeSolo
        onSelect={(selectedName: string | string[]) => {
          if (!Array.isArray(selectedName)) {
            setName(selectedName);
            onSelect(selectedName, amount, unit);
          }
        }}
      />
    </div>
  );
};

export default IngredientsInput;
