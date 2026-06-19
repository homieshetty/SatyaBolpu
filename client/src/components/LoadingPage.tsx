const LoadingPage = () => {
  return (
    <div
      className={`w-screen h-screen flex flex-col fixed items-center justify-center 
            bottom-0 overflow-hidden z-9997 bg-black`}
    >
      <img className="w-1/3" src="/assets/loading/gitige.gif" alt="loader" />
    </div>
  );
};

export default LoadingPage;
