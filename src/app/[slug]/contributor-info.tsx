import { Contribution, Prisma } from '@/generated/prisma';
import Link from 'next/link';
import React from 'react';

type FullContribution = Prisma.ContributionGetPayload<{
    include: {
        contributor: true
    },
}>;

interface Props {
    contribution:FullContribution;
}



export default function ContributorInfo({contribution}:Props) {
    return (
        <Link href={`https://github.com/${contribution.contributor.githubUserName}`}>
            <div className='
                flex
                h-10
                hover:-translate-x-5
            '>
                <div className='
                    dark:bg-gray-900
                    bg-gray-300
                    text-xs
                    h-10
                    rounded-l-full
                    translate-x-5
                    z-1
                    w-0
                    p-0
                    transition-all
                    flex
                    flex-col
                    justify-center
                    has-[+img:hover,+*+div:hover]:w-min
                    has-[+img:hover,+*+div:hover]:pl-4
                    has-[+img:hover,+*+div:hover]:pr-[calc(var(--spacing)*5+var(--spacing)*3)]
                    hover:w-min
                    hover:pl-4
                    hover:pr-[calc(var(--spacing)*5+var(--spacing)*3)]
                    overflow-hidden
                    peer/d
                '>
                    {contribution.description}
                </div>
                <img
                    src={`https://github.com/${contribution.contributor.githubUserName}.png`}
                    alt={contribution.contributor.githubUserName}
                    className='
                    dark:border-white
                    border-black
                    w-10
                    h-10
                    rounded-full
                    peer
                    z-2
                    border-solid
                    border
                    '
                />
                <div className='
                    text-xs
                    h-10
                    dark:bg-gray-900
                    bg-gray-300
                    rounded-r-full
                    z-1
                    w-0
                    p-0
                    transition-all
                    duration-300
                    peer-hover:w-fit
                    peer-hover:-mx-5
                    peer-hover:min-w-fit
                    peer-hover:pr-4
                    peer-hover:pt-0.5
                    peer-hover:pl-[calc(var(--spacing)*5+var(--spacing)*3)]
                    hover:w-fit
                    hover:-mx-5
                    hover:min-w-fit
                    hover:pr-4
                    hover:pt-0.5
                    hover:pl-[calc(var(--spacing)*5+var(--spacing)*3)]
                    overflow-hidden
                    flex
                    flex-col
                    justify-center
                    peer-hover/d:w-fit
                    peer-hover/d:-mx-5
                    peer-hover/d:min-w-fit
                    peer-hover/d:pr-4
                    peer-hover/d:pt-0.5
                    peer-hover/d:pl-[calc(var(--spacing)*5+var(--spacing)*3)]
                '>
                    {contribution.contributor.name}
                </div>
            </div>
        </Link>
    );
}