import React from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";

interface ErrorMessageProps {
  title?: string;
  message?: string;
}

const ErrorMessage = ({
  title = "No Available",
  message = "Try another provider or try again later",
}: ErrorMessageProps) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 h-screen">
      <div className="flex justify-center items-center gap-3 cursor-pointer group bg-white rounded-lg px-3 bg-opacity-20 hover:scale-105 duration-200 backdrop-blur-sm py-4">
        <p className="text-white text-4xl font-extrabold">{title}</p>
      </div>
      <p className="text-white text-xs font-medium flex justify-center items-center gap-1">
        <IoIosInformationCircleOutline className="text-[#F9CC0B] text-xl" />
        {message}
      </p>
    </div>
  );
};

export default ErrorMessage;
