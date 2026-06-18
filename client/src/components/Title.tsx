const Title = ({ title }: { title: string }) => {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-4">
      <div className="relative">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl text-center font-black tracking-tight
            text-transparent bg-clip-text bg-linear-to-r from-primary via-amber-400 to-primary
            whitespace-pre-wrap wrap-break-word text-wrap leading-tight"
        >
          {title}
        </h1>
        <h1
          className="absolute inset-0 text-4xl sm:text-5xl md:text-6xl text-center font-black tracking-tight
            text-primary blur-sm opacity-30 whitespace-pre-wrap wrap-break-word text-wrap leading-tight"
          aria-hidden
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center justify-center gap-3 w-4/5 sm:w-2/3 lg:w-1/2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/60" />
        <span className="text-lg sm:text-xl text-primary/80 font-bold drop-shadow-[0_0_8px_rgba(232,129,54,0.4)]">ॐ</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/60" />
      </div>
    </div>
  );
};

export default Title;
