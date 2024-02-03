"use client";

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/Switch/switch"
import React, {createContext, useContext, useState, useRef, useEffect} from 'react';
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import style from "./styles.module.scss"

export default function Component() {

    const [theme, setTheme] = useState('light'); // default theme

    useEffect(() => {
        document.body.className = theme + '-theme';
        console.log('theme', theme)
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };


    return (
        <div key="1" className={style.mainContainer}>
            <header className={style.header}>
                <Link className={style.link} href="#">
                    <MountainIcon className={style.icon} />
                    <span className={style.text}>Cito</span>
                </Link>
                <nav className={style.nav}>
                    <Link className={style.navLink} href="#">Home</Link>
                    <Link className={style.navLink} href="#">About</Link>
                </nav>
                <div className={style.searchBar}>
                    <Input className={style.input} placeholder="Enter your zip code" type="text" />
                    <Button size="sm">Submit</Button>
                    <Button size="sm">Enable Notifications</Button>
                    <div className={style.switchBar}>
                        <MoonIcon className={style.icon}/>
                        <Switch className={style.switch} onClick={toggleTheme}/>
                        <SunIcon className={style.icon}/>
                    </div>
                </div>
            </header>
            <main className={style.main}>
                <div className={style.grid}>
                    <Card>
                        <CardHeader>
                            <CardTitle>News Title</CardTitle>
                            <CardDescription>This is a brief description of the news.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className={style.content}>This is the full news content.</p>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm">Read More</Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>News Title</CardTitle>
                            <CardDescription>This is a brief description of the news.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className={style.content}>This is the full news content.</p>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm">Read More</Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>News Title</CardTitle>
                            <CardDescription>This is a brief description of the news.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className={style.content}>This is the full news content.</p>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm">Read More</Button>
                        </CardFooter>
                    </Card>
                    {/* Add any extra cards */}
                </div>
            </main>
            <footer className={style.footer}>
                <p className={style.copyright}>© 2024 Cito Inc. All rights reserved.</p>
                <nav className={style.nav}>
                    <Link className={style.navLink} href="#">Terms of Service</Link>
                    <Link className={style.navLink} href="#">Privacy</Link>
                </nav>
            </footer>
        </div>
    )
}

function MoonIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    )
}


function MountainIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
    )
}


function SunIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </svg>
    )
}
