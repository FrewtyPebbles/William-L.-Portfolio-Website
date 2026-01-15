import { ProjectSubLink } from '@/generated/prisma';
import Link from 'next/link';

interface Props {
    link: ProjectSubLink;
    className?: string;
}

export default function DropLink({link, className = ""}:Props) {
    return (
        <Link href={link.link} className={className}>
            <div className=''>
                <div className='
                dark:bg-gray-900
                dark:hover:bg-white
                dark:hover:text-black
                bg-gray-300
                hover:bg-black
                hover:text-white
                transition
                p-1
                pr-2
                rounded-sm
                peer
                '
                >
                🔗 {link.title}            
                </div>
                <div
                className={`
                    dark:peer-hover:bg-white
                    dark:peer-hover:text-black
                    peer-hover:bg-black
                    peer-hover:text-white
                    bg-inherit
                    overflow-hidden
                    absolute
                    transition-all
                    duration-1000
                    rounded-sm
                    pr-2
                    p-1
                    mt-1
                    w-fit
                    h-fit
                    max-w-100

                    opacity-0
                    pointer-events-none
                    peer-hover:pointer-events-auto
                    peer-hover:opacity-100
                `}
                >
                    <p className='grow'>
                        {link.description}
                    </p>
                </div>
            </div>
        </Link>
    );
}
