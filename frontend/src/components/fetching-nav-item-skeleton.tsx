import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const FetchingNavItemSkeleton = () => {
    return (
        <div className='p-2 gap-2 flex-col flex text-current/20'>
            <span className='fixed font-bold z-1 text-2xl '>
                <span className='inline-block animate-[rock_1s_ease_infinite]'>Fetching&nbsp;</span>
                &nbsp;
                <span className='inline-block animate-[rock_1s_ease_infinite_-0.5s]'>&nbsp;please&nbsp;</span>
                &nbsp;
                <span className='inline-block animate-[rock_1s_ease_infinite]'>&nbsp;wait .</span>
            </span>
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[450px]" />
        </div>
    );
}

export default FetchingNavItemSkeleton;
