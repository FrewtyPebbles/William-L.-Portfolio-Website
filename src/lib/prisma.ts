import "dotenv/config";
import { ContributionLevel, PrismaClient, ProjectProgress, ProjectSubImage } from '@/generated/prisma'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { promises as fs } from 'fs';
import path from 'path';

// You only pass the URL; the adapter creates the 'better-sqlite3' instance for you
const adapter = new PrismaBetterSqlite3({ 
  url: process.env["DATABASE_URL"] as string
})

const prisma = new PrismaClient({ adapter })

export default prisma

export async function seed_database() {
    const filePath_opencv = path.join(process.cwd(), 'private', 'open_cv_demo', 'opencv_ai_demo_full_description.md');
    const filePath_a_star = path.join(process.cwd(), 'private', 'a_star_project', 'a_star_gps_road_nav_system_description.md');
    let a_star_images:{src:string, title:string, description:string}[] = [];

    for (let [image_file_name, title] of [
        [
            "a_star_fullerton_-8152.207095985362_2495.2867764046973_-8159.574648414691_2491.437884082884.png",
            "A* Pathfinding Test"
        ],
        [
            "ucs_fullerton_-8152.207095985362_2495.2867764046973_-8159.574648414691_2491.437884082884.png",
            "UCS Pathfinding Test"
        ],
        [
            "a_star_fullerton_-8153.807306255795_2491.020486397002_-8152.061953049231_2491.271865099904.png",
            "A* Pathfinding Test"
        ],
        [
            "ucs_fullerton_-8153.807306255795_2491.020486397002_-8152.061953049231_2491.271865099904.png",
            "UCS Pathfinding Test"
        ],
        [
            "a_star_fullerton_-8156.074590433435_2492.3207273517323_-8155.031864678875_2491.893627238422.png",
            "A* Pathfinding Test"
        ],
        [
            "ucs_fullerton_-8156.074590433435_2492.3207273517323_-8155.031864678875_2491.893627238422.png",
            "UCS Pathfinding Test"
        ],
    ]) {
        a_star_images.push({
            src:`/a_star_project/${image_file_name}`,
            title:title,
            description:(()=>{
                switch (title) {
                    case "A* Pathfinding Test":
                        return "A test of the A* pathfinding algorithm in the CA Fullerton area given a random start and end coordinate.";
                
                    case "UCS Pathfinding Test":
                        return "A test of the UCS pathfinding algorithm in the CA Fullerton area given a random start and end coordinate.";

                    default:
                        return "";
                }
            })(),
        })
    }

    try {
        await prisma.project.create({
            data: {
                title: "OpenCV / AI Demo",
                slug: "opencv_ai_demo",
                progress: ProjectProgress.RELEASE,
                nav_description: "A live demo showcasing face tracking, AI emotion recognition, eye tracking, and facial landmark tracking.",
                full_description: await fs.readFile(filePath_opencv, 'utf8') as string,
                short_description: "",
                links: {
                    create: [
                        {
                            title: "Demo Source Code - Github",
                            link: "https://github.com/FrewtyPebbles/opencv_demo",
                            description: "The source code for a run-able demo of the project."
                        },
                        {
                            title: "Network Source Code - Github",
                            link: "https://github.com/FrewtyPebbles/Emotion-Recognition-AI",
                            description: "The Jupyter notebook used to create and train the neural network used in the demo."
                        }
                    ]
                },
                contributions: {
                    create: [
                        {
                            level:ContributionLevel.EVERYTHING,
                            description: "Sole Contributor",
                            contributor: {
                                create: {
                                    name: "William L.",
                                    githubUserName: "FrewtyPebbles"
                                }
                            }
                        }
                    ]
                }
            }
        });
        await prisma.project.create({
            data: {
                title: "A* GPS Road Navigation System",
                slug: "a_star_gps_road_navigation_system",
                progress: ProjectProgress.ALPHA,
                nav_description: "A GPS road navigation system utilizing A* to navigate Open Street Map data graphs.",
                full_description: await fs.readFile(filePath_a_star, 'utf8') as string,
                short_description: "",
                links: {
                    create: [
                        {
                            title: "Github",
                            link: "https://github.com/FrewtyPebbles/A-Star-GPS-Road-Navigation-System",
                            description: "The source code repository. Tests and findings writeup included."
                        }
                    ]
                },
                images:{
                    create: (()=>{
                        let images = [];
                        for (let a_star_image of a_star_images) {
                            images.push({
                                src: a_star_image.src,
                                title: a_star_image.title,
                                description: a_star_image.description
                            });
                        }
                        return images;
                    })()
                },
                contributions: {
                    create: [
                        {
                            level:ContributionLevel.EVERYTHING,
                            description: "Sole Contributor",
                            contributor: {
                                connectOrCreate: {
                                    where: {
                                        githubUserName: "FrewtyPebbles"
                                    },
                                    create: {
                                        name: "William L.",
                                        githubUserName: "FrewtyPebbles"
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        });
    } catch(error) {
        // console.error(error);
    }
  console.log("Seeded database!");
}

await seed_database()