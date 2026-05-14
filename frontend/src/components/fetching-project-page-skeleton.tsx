import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const FetchingProjectPageSkeleton = () => {
    return (
        <div className='h-[calc(100%-var(--spacing)*10)] w-full top-10 absolute left-0 flex-1 dark:bg-black bg-white pointer-events-auto text-current/50 p-4 flex flex-col gap-4'>
            <span className='fixed font-bold z-1 text-2xl '>
                <span className='inline-block animate-[rock_1s_ease_infinite]'>Fetching&nbsp;</span>
                &nbsp;
                <span className='inline-block animate-[rock_1s_ease_infinite_-0.5s]'>&nbsp;please&nbsp;</span>
                &nbsp;
                <span className='inline-block animate-[rock_1s_ease_infinite]'>&nbsp;wait .</span>
            </span>
            <div className='flex gap-4'>
                <Skeleton className="h-6 w-30" />
                <Skeleton className="h-6 w-50" />
            </div>
            <div className='flex gap-4 justify-between'>
                <Skeleton className="h-8 w-50" />
                <Skeleton className="p-7 rounded-full" />
            </div>
            <div className='flex flex-col gap-4 flex-1'>
                <Skeleton className="h-80 w-full" />
                <Skeleton className="w-full flex-1" />
            </div>
        </div>
    );
}

export default FetchingProjectPageSkeleton;

