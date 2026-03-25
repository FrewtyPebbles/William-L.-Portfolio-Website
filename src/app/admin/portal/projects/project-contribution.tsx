"use client"
import { Prisma, ContributionLevel } from "@/generated/prisma";
import { ChangeEvent, useRef, useState } from "react";

type FullContribution = Prisma.ContributionGetPayload<{
    include: {
        level: true,
        description: true,
        contributor: {
            select: {
                name:true,
                githubUserName:true,
            }
        }
    },
}>;

interface Props {
    contribution:FullContribution;
    onUpdate:(contribution:FullContribution|null) => void; // null means it was removed
};

export function ProjectContribution({contribution, onUpdate}:Props) {
    const error_msg = useRef("");

    function onChange(field:string, e:ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) {
        if (field === "level") {
            try {
                var contribution_level = {
                    "EXTRA_SMALL":ContributionLevel.EXTRA_SMALL,
                    "SMALL":ContributionLevel.SMALL,
                    "MEDIUM":ContributionLevel.MEDIUM,
                    "LARGE":ContributionLevel.LARGE,
                    "EXTRA_LARGE":ContributionLevel.EXTRA_LARGE,
                    "EVERYTHING":ContributionLevel.EVERYTHING,
                    "NON_APPLICABLE":ContributionLevel.NON_APPLICABLE,
                }[e.target.value]
            } catch {
                error_msg.current = `${e.target.value} is not a valid contribution level.`
                return;
            }
            contribution.level = contribution_level as ContributionLevel;
        }
        if (field === "description")
            contribution.description = e.target.value;
        if (field === "github_username")
            contribution.contributor.githubUserName = e.target.value;
        if (field === "name")
            contribution.contributor.name = e.target.value;
        if (error_msg.current !== "")
            error_msg.current = ""
        onUpdate(contribution);
    }

    return <div className='bg-blue-400 border-2 border-solid border-white w-fit'>
        <div>
            Level :
            <select className="admin-style" name="level" id="level" onChange={e=>onChange("level", e)} value={contribution?.level ? contribution.level : "EVERYTHING"}>
                <option value="EXTRA_SMALL">EXTRA_SMALL</option>
                <option value="SMALL">SMALL</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LARGE">LARGE</option>
                <option value="EXTRA_LARGE">EXTRA_LARGE</option>
                <option value="EVERYTHING">EVERYTHING</option>
                <option value="NON_APPLICABLE">NON_APPLICABLE</option>
            </select>
        </div>
        <div>
            github_username :
            <input onChange={e=>onChange("github_username", e)} className='admin-style' type="text" name="github_username" value={contribution.contributor.githubUserName} />
        </div>
        <div>
            name :
            <input onChange={e=>onChange("name", e)} className='admin-style' type="text" name="name" value={contribution.contributor.name} />
        </div>
        <div>
            Description :
            <textarea onChange={e=>onChange("description", e)} className='admin-style' name="description" id="" value={contribution.description} />
        </div>
        <div>
            <button onClick={e => onUpdate(null)} className='bg-red-500! admin-style' type="button">Remove</button>
        </div>
        <div className="text-red-500">
            {error_msg.current}
        </div>
    </div>
}
