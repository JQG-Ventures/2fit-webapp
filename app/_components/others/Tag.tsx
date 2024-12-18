import { FC } from "react";


interface TagProps {
  icon: FC<{ className?: string }>;
  text: string;
}

const Tag: FC<TagProps> = ({ icon: Icon, text }) => {
  return (
    <span className="flex items-center text-md px-6 py-2 border-2 border-emerald-500 text-emerald-600 rounded-full">
      <Icon className="w-5 h-5 mr-2 text-emerald-600" />
      {text}
    </span>
  );
};

export default Tag;
