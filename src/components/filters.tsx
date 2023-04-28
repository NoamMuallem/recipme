import React from "react";
import { type Filter, type Sort } from "y/server/api/routers/recipes";
import TagSelector from "./tagSelector";
import { IngredientNameAutocomplete } from "./ingredientsSelector";
import { useSession } from "next-auth/react";

const Filters = ({
  sort,
  filters,
  setSort,
  setFilter,
}: {
  sort: Sort;
  filters: Filter;
  setSort: (sort: Sort) => void;
  setFilter: (filter: Filter) => void;
}) => {
  const { data: sessionData } = useSession();

  return (
    <div className="my-5 flex w-full flex-wrap justify-evenly rounded-md bg-accent-content bg-opacity-30 py-2 backdrop-blur-lg">
      <div className="flex items-center">
        <label htmlFor="title" className="mr-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={filters.title}
          onChange={(e) => setFilter({ ...filters, title: e.target.value })}
          className="input-bordered input input-sm"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="rating" className="mr-2">
          Rating
        </label>
        <input
          id="rating"
          type="number"
          min={0}
          max={5}
          value={filters.rating}
          onChange={(e) =>
            setFilter({ ...filters, rating: Number(e.target.value) })
          }
          className="input-bordered input input-sm"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="sortField" className="mr-2">
          Sort By
        </label>
        <select
          id="sortField"
          value={sort.field}
          onChange={(e) => {
            const value = e.target.value;
            if (
              value !== "title" &&
              value !== "createdAt" &&
              value !== "averageRating"
            )
              return;
            setSort({ ...sort, field: value });
          }}
          className="select-bordered select select-sm"
        >
          <option value="title">Title</option>
          <option value="createdAt">Created At</option>
          <option value="averageRating">Average Rating</option>
        </select>
      </div>
      <div className="flex items-center">
        <label htmlFor="sortDirection" className="mr-2">
          Sort Direction
        </label>
        <select
          id="sortDirection"
          value={sort.direction}
          onChange={(e) => {
            const value = e.target.value;
            if (value !== "desc" && value !== "asc") return;
            setSort({ ...sort, direction: value });
          }}
          className="select-bordered select select-sm"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      {sessionData?.user && (
        <>
          <label className="form-control label flex cursor-pointer flex-row items-center gap-2">
            <span className="label-text">favorites</span>
            <input
              type="checkbox"
              checked={filters.favoritesOnly}
              onChange={(e) =>
                setFilter({ ...filters, favoritesOnly: e.target.checked })
              }
              className="checkbox-info checkbox"
            />
          </label>
          <label className="form-control label flex cursor-pointer flex-row items-center gap-2">
            <span className="label-text">my recipes</span>
            <input
              type="checkbox"
              checked={filters.myRecipes}
              onChange={(e) =>
                setFilter({ ...filters, myRecipes: e.target.checked })
              }
              className="checkbox-info checkbox"
            />
          </label>
        </>
      )}
      <TagSelector
        isMulti
        onSelect={(values: string | string[]) => {
          if (Array.isArray(values)) {
            setFilter({ ...filters, tags: values });
          }
        }}
      />
      <IngredientNameAutocomplete
        onSelect={(value: string | string[]) => {
          if (Array.isArray(value)) {
            setFilter({ ...filters, ingredients: value });
          }
        }}
      />
    </div>
  );
};

export default Filters;
