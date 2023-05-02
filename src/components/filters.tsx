import React from "react";
import { type Filter } from "y/server/api/routers/recipes";
import TagSelector from "./tagSelector";
import { IngredientNameAutocomplete } from "./ingredientsSelector";

const Filters = ({
  filters,
  setFilter,
}: {
  filters: Filter;
  setFilter: (filter: Filter) => void;
}) => {
  return (
    <div className="my-5 flex w-full flex-wrap justify-evenly rounded-md bg-accent-content bg-opacity-30 py-2 backdrop-blur-lg">
      <div className="flex items-center">
        <label htmlFor="title" className="mr-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={filters.titleSubstring}
          onChange={(e) =>
            setFilter({ ...filters, titleSubstring: e.target.value })
          }
          className="input-bordered input input-sm"
        />
      </div>
      <TagSelector
        isMulti
        onSelect={(values: string | string[]) => {
          if (Array.isArray(values)) {
            setFilter({ ...filters, tagNames: values });
          }
        }}
      />
      <IngredientNameAutocomplete
        isMulti
        onSelect={(value: string | string[]) => {
          if (Array.isArray(value)) {
            setFilter({ ...filters, ingredientNames: value });
          }
        }}
      />
    </div>
  );
};

export default Filters;
