import { signIn, signOut, useSession } from "next-auth/react";

export const Header = () => {
  const { data: sessionData } = useSession();

  const userName = sessionData?.user.name;

  return (
    <header className="navbar bg-primary text-primary-content">
      <div className="flex-1 pl-5 text-3xl font-bold">
        {userName ? `${userName}` : ""}
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown-end dropdown">
          {sessionData?.user ? (
            <div className="flex flex-row align-top">
              <span className="btn-ghost btn " onClick={() => void signOut()}>
                Logout
              </span>
              <div className="avatar">
                <div className="w-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                  <img
                    src={sessionData?.user?.image ?? ""}
                    alt={sessionData?.user?.name ?? ""}
                  />
                </div>
              </div>
            </div>
          ) : (
            <button
              className="btn-ghost rounded-btn btn"
              onClick={() => void signIn()}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
