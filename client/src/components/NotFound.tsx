import { BiSolidError } from "react-icons/bi";

const NotFound = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-5 text-xl  text-white bg-black font-semibold">
      <BiSolidError color="red" size="35px"/>
      <div className="flex items-center justify-center gap-5">
        <h1>404</h1><p>|</p><p>Page Not Found</p>
      </div>
    </div>
  );
};

export default NotFound;