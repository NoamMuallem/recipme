import { useRouter } from "next/router";
import Spinner from "y/components/base/spinner";
import { api } from "y/utils/api";

const Recipe = () => {
  const router = useRouter();
  const { id: recipeID } = router.query;
  const { data, isLoading, error } = api.recipe.getOne.useQuery(
    {
      //to make TS happy, will not get triggered will be disabled
      recipeID: typeof recipeID === "string" ? recipeID : null,
    },
    {
      enabled: typeof recipeID === "string",
    }
  );
  if (error) return <div>{error.message}</div>;
  if (isLoading || !data) return <Spinner />;

  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl font-bold">{data.title}</h1>

      <div className="container mx-auto my-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <img
              className="h-auto w-full rounded-lg object-cover"
              src={data.image}
              alt="Recipe"
            />
            <p className="mt-4 text-lg text-gray-700">{data.description}</p>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold">{`Rating: ${data.averageRating}`}</h2>
            <h2 className="mb-4 text-2xl font-semibold">Ingredients</h2>
            <ul className="list-inside list-disc space-y-2">
              {data.ingredients.map((ingredient) => (
                <li
                  key={ingredient.ingredientName.id}
                  className="text-gray-700"
                >
                  {ingredient.amount} {ingredient.ingredientName.name}
                </li>
              ))}
            </ul>
            <h2 className="mb-4 text-2xl font-semibold">Tags</h2>
            <ul className="list-inside list-disc space-y-2">
              {data.recipeTags.map((tag) => (
                <li key={tag.tagID} className="text-gray-700">
                  {tag.tag.name}
                </li>
              ))}
            </ul>
            <h2 className="mt-6 mb-4 text-2xl font-semibold">Directions</h2>
            <p className="whitespace-pre-line text-gray-700">
              {data.directions}
            </p>
            <div className="mt-4">
              <span className="text-lg font-semibold">Yield:</span>{" "}
              <span className="text-lg text-gray-700">
                {data.yield} servings
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipe;
