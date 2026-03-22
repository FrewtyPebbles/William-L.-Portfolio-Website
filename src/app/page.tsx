import LetterRenderer from "@/components/letter_renderer/letter-renderer";
import TextColorer from "@/components/text-colorer";
import TextTyper from "@/components/text-typer";
import Link from "next/link";


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
                <TextTyper className="font-extrabold" text="Computer Scientist" scramble_set={["█", "▓", "▒", "░"]}/> | <TextColorer text="Artist" className="pointer-events-auto font-extrabold"/>
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
                      src:"/static/github.svg",
                      href:"https://github.com/FrewtyPebbles",
                      alt:"GitHub"
                    },
                    {
                      src:"/static/linkedin.svg",
                      href:"https://www.linkedin.com/in/william-lim-87733a270/",
                      alt:"Linked In"
                    },
                  ].map(({src, href, alt}, index) => {
                    return <SocialIcon
                      src={src}
                      href={href}
                      alt={alt}
                      key={index}
                      className="
                      transition-all
                      hover:opacity-50
                      hover:cursor-pointer
                      "
                    />
                  })}
                  <div className="w-5"></div>
                  <a href="/about"
                  className="
                      transition-all
                      hover:underline
                      hover:text-gray-400
                      hover:cursor-pointer
                      flex items-center justify-center
                      "
                  >
                    <div className="h-fit">
                      About Me
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
      <img className={className} src={src} width={30} height={30} alt={alt}/>
  </Link>
}