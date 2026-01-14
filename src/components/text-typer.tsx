"use client"
import React, { useState } from 'react';

interface Props {
    text:string;
    speed_seconds?:number;
    scramble_set?:Array<string>;
}

export default function TextTyper({text, speed_seconds = 0.1, scramble_set = ["0", "|", "!", ";", ":", ",", ".", ",", ":", ";", "!", "|", "?"]}:Props) {
    let text_array:Array<Array<string>> = [];
    let index_array:Array<number> = [];
    for (let letter of Array.from(text)) {
        text_array.push([letter, ...scramble_set])
        index_array.push(0);
    }
    
    const [letterIndexState, setLetterIndexState] = useState<Array<number>>(index_array);

    return (
        <span>
            {Array.from(text_array).map((_, letter_index) => {
                let index = letterIndexState[letter_index];
                let letter = text_array[letter_index][index];
                return (<span className="pointer-events-auto" key={letter_index}
                onMouseOver={() => {
                    // set to max first
                    setLetterIndexState(prev => {
                        const lis = [...prev];
                        lis[letter_index] = scramble_set.length;
                        return lis;
                    });

                    const intervalId = setInterval(() => {
                        setLetterIndexState(prev => {
                            const lis = [...prev];
                            lis[letter_index] -= 1;
                            if (lis[letter_index] <= 0) {
                                clearInterval(intervalId); // stop repeating
                                lis[letter_index] = 0; // clamp at 0
                            }
                            return lis;
                        });
                    }, 1000 * speed_seconds);
                }}
                >
                    {letter}
                </span>);
            })}
        </span>
    );
}

