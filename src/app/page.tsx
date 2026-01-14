import LetterRenderer from "@/components/letter_renderer/letter-renderer";
import TextColorer from "@/components/text-colorer";
import TextTyper from "@/components/text-typer";


export default function Home() {
  return (
    <div className="h-full w-full top-0">
      <div className="h-full w-full">
        <div className="absolute top-0 w-full h-full pointer-events-none">
          <div className="grid place-items-center h-full w-full">
            <div className="
              mt-20
              p-1
              dark:bg-white
              dark:text-black
              bg-black
              text-white
              mix-blend-difference
            ">
              <TextTyper text="Computer Scientist"/> | <TextColorer text="Illustrator" className="pointer-events-auto"/>
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
