"use client"
import Script from 'next/script'
import { useEffect, useLayoutEffect } from 'react';

function set_theme() {
    const darkModeMql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

    if (darkModeMql && darkModeMql.matches) {
        // dark mode
        document.documentElement.className += " dark ";
    } else {
        // light mode
        document.documentElement.className.replaceAll(" dark ", "")
    }
}

const TailwindDarkmodeFix = () => {
    useLayoutEffect(() => {
        const cb = (event:MediaQueryListEvent) => {
            const color_scheme = event.matches ? "dark" : "light";
            if (color_scheme == "dark") {
                document.documentElement.className += " dark ";                
            } else if (color_scheme == "light") {
                document.documentElement.className.replaceAll(" dark ", "")
            }
        }

        const match_media = window.matchMedia('(prefers-color-scheme: dark)');
        match_media.addEventListener('change', cb);

        set_theme()

        window.addEventListener('popstate', set_theme);
        window.addEventListener('load', set_theme);
        
        return () => {
            window.removeEventListener('popstate', set_theme);
            window.removeEventListener('load', set_theme);
            match_media.removeEventListener('change', cb);
        }
    }, [])
    return null;
}

export default TailwindDarkmodeFix;
