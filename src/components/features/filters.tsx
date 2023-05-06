import React from "react";
import { type Filter } from "y/server/api/routers/recipes";
import TagSelector from "./tagSelector";
import { IngredientNameAutocomplete } from "./ingredientsSelector";
import { useRouter } from "next/router";

const Filters = ({
  filters,
  setFilter,
}: {
  filters: Filter;
  setFilter: (filter: Filter) => void;
}) => {
  const router = useRouter();

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
        optionsToHide={filters.tagNames}
        onSelect={(values: string | string[]) => {
          if (Array.isArray(values)) {
            setFilter({ ...filters, tagNames: values });
          }
        }}
      />
      <IngredientNameAutocomplete
        isMulti
        optionsToHide={filters.ingredientNames}
        onSelect={(value: string | string[]) => {
          if (Array.isArray(value)) {
            setFilter({ ...filters, ingredientNames: value });
          }
        }}
      />
      <button className="btn" onClick={() => router.push("/new")}>
        create
      </button>
    </div>
  );
};

export default Filters;
