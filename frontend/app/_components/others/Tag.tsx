import { FC } from 'react';

interface TagProps {
    icon: FC<{ className?: string }>;
    text: string;
    iconClassName: string;
}

const Tag: FC<TagProps> = ({ icon: Icon, text, iconClassName }) => {
    return (
        <span className="flex items-center text-md px-6 py-2 capitalize">
            <Icon className={iconClassName} />
            {text}
        </span>
    );
};

export default Tag;
