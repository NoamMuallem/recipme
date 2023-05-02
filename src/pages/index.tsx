import { type Recipe } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Filters from "y/components/filters";
import Spinner from "y/components/spinner";
import { type Filter } from "y/server/api/routers/recipes";
import { api } from "y/utils/api";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const [filter, setFilter] = useState<Filter>({
    ingredientNames: [],
    tagNames: [],
    titleSubstring: "",
  });

  const { data, isLoading } = api.recipe.getRecipes.useQuery(
    {
      filter,
      pagination: {},
    },
    {
      enabled: Boolean(sessionData?.user),
    }
  );

  return (
    <>
      <Head>
        <title>Recipme</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {sessionData?.user && (
        <>
          <Filters filters={filter} setFilter={setFilter} />
          <div className="mx-auto max-w-7xl columns-3 space-y-4">
            {isLoading ? (
              <Spinner />
            ) : (
              data?.map((recipe) => (
                <RecipePreviewCard recipe={recipe} key={recipe.id} />
              ))
            )}
          </div>
        </>
      )}
    </>
  );
};

const RecipePreviewCard = ({ recipe }: { recipe: Recipe }) => {
  const router = useRouter();

  const goToRecipePage = () => {
    router
      .push(`/recipes/${recipe.id}`)
      .catch((error) => console.error("redirect error", error));
  };

  return (
    <div
      onClick={goToRecipePage}
      className="card glass h-fit w-[1/3] overflow-hidden rounded-md"
    >
      <figure>
        <img src={recipe.image} alt={recipe.title} />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{recipe.title}</h2>
        <p>{recipe.description}</p>
      </div>
    </div>
  );
};

export default Home;
