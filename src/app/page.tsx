import LetterRenderer from "@/components/letter_renderer/letter-renderer";
import TextColorer from "@/components/text-colorer";
import TextTyper from "@/components/text-typer";
import Link from "next/link";
import Image from "next/image";


export default function Home() {
  return (
    <div className="h-full w-full top-0">
      <div className="h-full w-full">
        <div className="absolute top-0 w-full h-full">
          <div className="
            grid place-items-center
            h-full w-full justify-items-center
          ">
            <div>  
              <div className="
                mt-40
                p-1
                dark:bg-white/50
                dark:text-black
                bg-black/50
                text-white
                backdrop-blur-xs
                rounded-sm
              ">
                <TextTyper text="Computer Scientist"/> | <TextColorer text="Illustrator" className="pointer-events-auto"/>
              </div>
              <div className="
                flex flex-row
                justify-center
              ">
                {/* Links */}
                <div className="
                  w-fit
                  p-1
                  mt-5
                  dark:bg-white/20
                  dark:text-white
                  bg-black/20
                  text-black
                  backdrop-blur-xs
                  rounded-sm
                  flex flex-row
                  justify-around
                  gap-3
                ">
                  {[
                    {
                      src:"/github.svg",
                      href:"https://github.com/FrewtyPebbles",
                      alt:"GitHub"
                    },
                    {
                      src:"/linkedin.svg",
                      href:"https://github.com/FrewtyPebbles",
                      alt:"GitHub"
                    },
                  ].map(({src, href, alt}, index) => {
                    return <SocialIcon
                      src={src}
                      href={href}
                      alt={alt}
                      key={index}
                      className="
                      transition-all
                      hover:blur-none
                      blur-[1px]
                      hover:cursor-pointer
                      "
                    />
                  })}
                  <div className="w-5"></div>
                  <a href="/about"
                  className="
                      transition-all
                      hover:blur-none
                      blur-[1px]
                      hover:cursor-pointer
                      flex items-center justify-center
                      "
                  >
                    <div className="h-fit">
                      Where am I?
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LetterRenderer
            text={"William Lim"}
            size={50}
            canvas_height_multiplier={7}
            className="
            w-screen absolute left-0 top-0 z-[-1]
            flex-1 dark:bg-black  bg-white
            "
            />
      </div>
    </div>
  );
}

interface SocialIconProps {
  className?:string;
  src:string;
  href:string;
  alt:string;
}

function SocialIcon({className, src, href, alt}:SocialIconProps) {
  return <Link href={href}>
      <Image className={className} src={src} width={30} height={30} alt={alt}/>
  </Link>
}