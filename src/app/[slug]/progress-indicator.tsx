import { ProjectProgress } from '@/generated/prisma';
import React from 'react';

interface Props {
    progress:ProjectProgress
};

export default function ProgressIndicator({progress}:Props) {
    let bg_color = "bg-white";
    
    switch (progress) {
        case ProjectProgress.PROTOTYPING:
            bg_color = "bg-purple-500";
            break;

        case ProjectProgress.DEVELOPMENT:
            bg_color = "bg-blue-500";
            break;

        case ProjectProgress.ALPHA:
            bg_color = "bg-orange-500";
            break;

        case ProjectProgress.BETA:
            bg_color = "bg-yellow-500";
            break;

        case ProjectProgress.RELEASE:
            bg_color = "bg-green-500";
            break;
    }
    return (
        <div className={`
            dark:text-white
            dark:border-white
            text-black
            border-black
            border-solid
            border-2
            rounded
            mt-2
            px-2
            text-sm
            h-5
            m-1
            ml-3
            flex
            flex-col
            justify-center
            bottom-0
            ${bg_color}
        `}>
            {progress}
        </div>
    );
}
