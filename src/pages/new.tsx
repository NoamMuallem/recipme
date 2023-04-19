import { type Tag } from "@prisma/client";
import React, { useState } from "react";
import IngredientSelector from "y/components/ingredientsSelector";
import TagSelector from "y/components/tagSelector";
import { type RecipeInput } from "y/server/api/routers/recipes";
import { api } from "y/utils/api";

const CreateRecipe: React.FC = () => {
  const { mutate } = api.recipe.createRecipe.useMutation();

  const [recipe, setRecipe] = useState<RecipeInput>({
    title: "",
    ingredients: [],
    description: "",
    yield: 0,
    directions: "",
    image: "",
    tags: [],
  });

  const handleSubmit = () => {
    try {
      const newRecipe = mutate(recipe);
      console.log("New recipe created:", newRecipe);
    } catch (error) {
      console.error("Failed to create recipe:", error);
    }
  };

  const handleIngredientChange = (
    index: number,
    ingredient: { amount: number; name: string }
  ) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = ingredient;
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleTagChange = (index: number, tag: { name: string }) => {
    const newTags = [...recipe.tags];
    newTags[index] = tag;
    setRecipe({ ...recipe, tags: newTags });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl">Create a new recipe</h1>
      <div className="card bordered">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              className="input-bordered input"
              value={recipe.title}
              onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea-bordered textarea"
              value={recipe.description}
              onChange={(e) =>
                setRecipe({ ...recipe, description: e.target.value })
              }
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Yield</span>
            </label>
            <input
              type="number"
              className="input-bordered input"
              value={recipe.yield}
              onChange={(e) =>
                setRecipe({ ...recipe, yield: Number(e.target.value) })
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Image URL</span>
            </label>
            <input
              type="text"
              className="input-bordered input"
              value={recipe.image}
              onChange={(e) => setRecipe({ ...recipe, image: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Directions</span>
            </label>
            <textarea
              className="textarea-bordered textarea"
              value={recipe.directions}
              onChange={(e) =>
                setRecipe({ ...recipe, directions: e.target.value })
              }
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Ingredients</span>
            </label>
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="mb-1">
                <IngredientSelector
                  onSelect={(value) =>
                    handleIngredientChange(index, {
                      ...ingredient,
                      name: value,
                    })
                  }
                />
              </div>
            ))}
            <button
              className="btn-primary btn-sm btn mt-2"
              onClick={() =>
                setRecipe({
                  ...recipe,
                  ingredients: [...recipe.ingredients, { amount: 0, name: "" }],
                })
              }
            >
              Add Ingredient
            </button>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Tags</span>
            </label>
            {recipe.tags.map((_tag, index) => (
              <div key={index} className="mb-1">
                <TagSelector
                  onSelect={(value) => handleTagChange(index, { name: value })}
                />
              </div>
            ))}
            <button
              className="btn-primary btn-sm btn mt-2"
              onClick={() =>
                setRecipe({ ...recipe, tags: [...recipe.tags, { name: "" }] })
              }
            >
              Add Tag
            </button>
          </div>

          <div className="form-control mt-4">
            <button className="btn-primary btn" onClick={handleSubmit}>
              Create Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipe;
