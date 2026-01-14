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
                bg-gray-900
                transition
                hover:bg-white
                hover:text-black
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
                    overflow-hidden
                    absolute
                    transition-all
                    duration-1000
                    bg-inherit
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
                    peer-hover:bg-white
                    peer-hover:text-black
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
