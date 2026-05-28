
const Title = ({title} : {title: string}) => {
  
  return (
    <div className="w-full flex flex-col justify-center items-center">
        <div
          className="text-primary w-4/5 text-4xl sm:text-6xl text-center font-bold bg-black whitespace-pre-wrap wrap-break-word
            text-wrap leading-none mb-3">
            {title}
        </div>

        <div className="flex items-center justify-center w-4/5 sm:w-2/3 lg:w-1/2 mx-auto">
          <div className="w-1/2 border-t-2 border-solid border-primary"></div>
          <span className="mx-4 text-xl text-primary font-bold">ॐ</span>
          <div className="w-1/2 border-t-2 border-solid border-primary grow"></div>
        </div>
    </div>
  )

}

export default Title;
