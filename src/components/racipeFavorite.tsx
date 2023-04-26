import { api } from "y/utils/api";
import Spinner from "./spinner";

const UserFavorite = ({ recipeID }: { recipeID: string }) => {
  const utils = api.useContext();
  const {
    data,
    isLoading: isDataLoading,
    error: dataError,
  } = api.favorites.getRecipeUserFavorite.useQuery({
    recipeID,
  });

  const {
    mutate,
    isLoading: isUpdateLoading,
    error: updateError,
  } = api.favorites.updateRating.useMutation({
    onSuccess: async () => {
      await utils.favorites.getRecipeUserFavorite.invalidate();
    },
  });

  if (dataError || updateError)
    return <div>{dataError?.message ?? updateError?.message}</div>;
  if (isDataLoading || isUpdateLoading) return <Spinner />;

  const favoriteByUser = Boolean(data?.favoritedBy[0]);

  return (
    <div>
      <button
        className="rounded-md bg-indigo-500 py-1 px-4 text-white"
        onClick={() => mutate({ recipeID, favorite: !favoriteByUser })}
      >
        {`${favoriteByUser ? "Remove from" : "Add to"} favorites`}
      </button>
    </div>
  );
};

export default UserFavorite;
