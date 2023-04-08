import Link from "next/link";

const Filters = () => {
  return (
    <div className="my-5 mx-4 flex w-full flex-row justify-evenly bg-accent-content bg-opacity-30 py-2 backdrop-blur-lg">
      <div className="btn-group flex flex-row">
        <button className="btn">Top Rated</button>
        <button className="btn">Top Rated</button>
        <button className="btn">Top Rated</button>
      </div>
      <Link href="new" className="btn-ghost btn">
        Add New
      </Link>
    </div>
  );
};

export default Filters;
