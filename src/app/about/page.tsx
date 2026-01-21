import Image from 'next/image';


interface Props {

};

export default function Page({}:Props) {
    const span_hover_classes = "hover:font-extrabold transition-all durration-1000"
    const link_style = "transition duration-300 pl-1 pr-1 hover:text-white text-blue-300 hover:bg-blue-400/40 hover:cursor-pointer rounded-sm"

    return <div className="min-h-full w-full flex flex-col justify-center">
        <div className="my-20">
            <h1 className="text-5xl font-extralight text-right p-10 bg-radial 
            dark:from-white 
            dark:to-white/80 
            dark:text-black
            from-black 
            to-black/80 
            text-white
            ">
                <span className={`${span_hover_classes}`}>What</span> <span className={`${span_hover_classes}`}>is</span> <span className={`${span_hover_classes}`}>WAL</span> <span className={`${span_hover_classes}`}>of</span> <span className={`inline-block transform transition-transform hover:-rotate-5 ${span_hover_classes}`}>CODE</span> <span className={`${span_hover_classes}`}>?</span>
            </h1>
            <div className="p-10 indent-10">
                <b>WAL of Code</b> is the portfolio website of <b>William A. Lim</b> (me ;D). It showcases all of the projects I have worked on for both assignments in college and out of personal interest.
                Additionally it links resumes relevant to industries I am searching for employment in. So if you are interested in hiring me please feel free to check out my resumes!
            </div>
            <h1 className="text-5xl font-extralight text-left p-10 bg-radial 
            dark:from-white 
            dark:to-white/80 
            dark:text-black
            from-black 
            to-black/80 
            text-white
            ">
                <span className={`${span_hover_classes}`}>Who</span> <span className={`${span_hover_classes}`}>is</span> <span className={`inline-block transform transition-transform hover:rotate-5 ${span_hover_classes}`}>William Lim</span> <span className={`${span_hover_classes}`}>?</span>
            </h1>
            <div className="">
                <div className="p-10">
                    <div className='
                        float-right max-sm:max-w-full max-w-[50%] sm:ml-10 mb-10 z-0 transition-all duration-500
                    '>
                    <img className='
                        mask-b-from-90% sm:mask-l-from-90% mask-t-from-99% mask-r-from-99% mask-l-from-99% max-h-[700px]
                    ' src="/7bbb6f2a-f00e-4005-8a19-17c318c0691b.jpg" alt="profile" />
                    <div className='text-sm text-right text-gray-400 pr-1'> - photo courtesy of my lovely girlfriend</div>
                    </div>
                    <h2 className="text-xl">About</h2>

                    <p className="py-5 indent-10">
                        I (William Lim) am a computer scientist currently based out of Fullerton, CA in the United States.
                        Though I spend a majority of my time programming, I also enjoy camping, going to the beach or festivals with friends, exercising, and playing videogames socially.
                    </p>

                    <h2 className="text-xl">Where Did it Start ?</h2>

                    <p className="py-5 indent-10">
                        Since a young age I've always had a keen interest in programming and electronics. When I was around 10 years old my dad introduced me to java. While it didn't quite stick in my still developing
                        10 year old brain at the time, it planted a seed that in the future would be watered into thriving plant always hungry to learn more.
                    </p>

                    <h2 className="text-xl">The Ubuntu Laptop</h2>

                    <p className="py-5 indent-10">
                        Soon, I got my first laptop running windows vista around the age of 13 and discovered the internet.
                        The world wide web was a deep ocean with big waves and my curious mind was ready to surf. Little did I know there were digital creatures of pure evil lurking in those depths.
                        After having to reinstall windows multiple times due to viruses rendering my PC in-operable my dad was fed up
                        and put me on <a className={link_style} href="https://ubuntu.com/">Ubuntu</a>.  To the 15 year old kid who only wanted to play minecraft with their friends at the time, Ubuntu was strange and frusterating.
                        I was forced to learn how to navigate the terminal and a now ancient software called <a className={link_style} href="https://www.winehq.org/">Wine</a>. Thanks to my struggles, I was able to get a minecraft client and server port forwarded and running on our home network.
                        Soon after foolishly posting our network IP with the open port on the internet with hopes of ruling over a minecraft kingdom of strangers, our home network got <a className={link_style} href="https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/">DDoS attacked</a> and my father put an end to my minecraft server kingdom.
                    </p>

                    <h2 className="text-xl">Years Later</h2>

                    <p className="py-5 indent-10">
                        In highschool I became interested in illustration and programming. Learning art taught me patience and made me appreciate quality work.
                        I understood better the value of ambition and planning creative tasks. The medium of comic books and videogames captivated me.
                        Throughout elementary and middle school I had tried my hand at game development, with
                        the event based game engine <a className={link_style} href="https://www.clickteam.com/clickteam-fusion-2-5">Clickteam Fusion</a>, <a className={link_style} href="https://gamemaker.io/en">GameMaker</a>'s
                        <a className={link_style} href="https://manual.gamemaker.io/monthly/en/GameMaker_Language/GameMaker_Language_Index.htm">GML</a>, and <a className={link_style} href="https://www.roblox.com/">Roblox</a>'s <a className={link_style} href="https://luau.org/">Luau</a> language.
                        My design skills from my interest in illustration helped me create my first ever portfolio website as a teenager featuring the videogames I made in highschool.
                    </p>

                    <h2 className="text-xl text-center">College <i>(Now)</i></h2>

                    <p className="py-5 indent-10 text-center">
                        In my first few years of college I studied as a Bachelor of Studio Art with a minor in Computer Science. Believing wholeheartedly this was going to be my career I locked myself away days at a time to practice the arts.
                        Sitting at my desk doing artistic studies and learning anatomy, composition, gesture, design, line work, and color for sometimes over 7 hours straight.  I was determined to make it big time as a comicbook artist.
                        3-ish years into my degree the image generation model <a className={link_style} href="https://openai.com/index/dall-e-2/">DALL-E 2</a> shocked the world. While most artists were anxious about its release, DALL-E 2 re-ignited my passion and interest in software.
                        This was the turning point that convinced me to pursue a double major in Computer Science and Studio Art. Since then I have taken a break from actively studying art and dedicated the same riggor of effort to computer science as I have art.
                    </p>
                </div>
            </div>
        </div>
    </div>
}