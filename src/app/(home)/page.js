"use client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter} from "next/navigation";
import { Modal } from "@/components/Modal/modal";
import React, {useEffect, useState, useRef} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import style from "./styles.module.scss";
// import { doInsert } from "lib/database";
import { v4 as uuidv4 } from 'uuid';



export default function Component() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null); // New state
    const [successMessage, setSuccessMessage] = useState('');


    const [zipCode, setZipCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    // const [deviceID, setDeviceID] = useState(''); // New state
    const deviceID = useRef('');

    const isValidZipCode = (zipCode) => {
        const zipCodePattern = /^\d{5}(-\d{4})?$/;
        return zipCodePattern.test(zipCode);
    };

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('Service Worker Registered with scope:', registration.scope);
            }).catch(function(err) {
                console.error('Service Worker registration failed:', err);
            });
        }
    }, []);


    const requestNotificationPermission = async () => {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.error("Permission not granted for Notification");
            return null;
        }
        return await subscribeUserToPush();
    };

    const subscribeUserToPush = async () => {
        const serviceWorker = await navigator.serviceWorker.ready;
        return await serviceWorker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: "BPAtx6LpjenJ8M3MhoCV04GVEcIcRL-N7D1WmyLNcADO3mxv0pefzc9t9417ABbx4IjMPCw_GXfk7ztYBJ2-29c"
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isValidZipCode(zipCode)) {
            setSuccessMessage('')
            setErrorMessage('Invalid ZIP code entered.');
            return;
        } else {
            setSuccessMessage('ZIP code submitted successfully.');
            setErrorMessage('');
        }

        const subscription = await requestNotificationPermission();
        if (!subscription) {
            setErrorMessage('Failed to create notification subscription.');
            return;
        }

        if(!deviceID.current) {
            setDeviceIdCookie()
        }

        const params = new URLSearchParams({
            deviceID: deviceID.current,
            zipCode: zipCode,
            subscription: JSON.stringify(subscription)
        });

        try {
            const response = await fetch("/api/add-user?" + params);
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };


    const setDeviceIdCookie = () => {
        const deviceIDCookie = getCookie('deviceId');
        if (!deviceIDCookie) {
            deviceID.current = uuidv4();
            document.cookie = `deviceId=${deviceID.current}; path=/; max-age=31536000`; // Expires in 1 year
        }
        else{
            deviceID.current = deviceIDCookie;
        }
        console.log(`Device ID: ${deviceID.current}`)
        return deviceID.current;
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        setSelectedArticle(null); // Reset the article view when closing the modal
    };

    const handleReadMore = (article) => {
        setSelectedArticle(article); // Set the selected article
    };

    const articles = [
        { id: 1, title: "News Title 1", description: "Brief description 1", content: "Full news content 1" },
        { id: 2, title: "News Title 2", description: "Brief description 2", content: "Full news content 2" },
        // Some dummy articles which we populate with our real api
    ];

    const displayMessage = (message, sender) => {
        // const chatWindow = document.querySelector(`.${style.chatWindow}`);
        const chatWindow = document.getElementById('chatWindow');
        const messageElement = document.createElement('div');
        messageElement.classList.add(style.message);
        messageElement.classList.add(sender === 'user' ? style.userMessage : style.apiMessage);
        messageElement.textContent = message;
        console.log(messageElement);
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    const toggleInputState = (isDisabled) => {
        const messageInput = document.querySelector(`.${style.textInput}`);
        messageInput.disabled = isDisabled;
    };

    function processUserMessage() {
        const messageInput = document.querySelector(`.${style.textInput}`);
        const userMessage = messageInput.value.trim();
        if (userMessage) {
            displayMessage(userMessage, 'user');
            messageInput.value = '';
            toggleInputState(true);

            // Simulate API call and response
            setTimeout(() => {
                const apiResponse = "This is a response from the API.";
                displayMessage(apiResponse, 'api');
                toggleInputState(false);
            }, 100); // Simulating  delay for API response
        }
    }

    useEffect(() => {
        const messageInput = document.querySelector(`.${style.textInput}`);

        if (messageInput) {
            const handleKeyDown = (event) => {
                if (event.key === 'Enter') {
                    processUserMessage();
                }
            };

            messageInput.addEventListener('keydown', handleKeyDown);

            // Clean up the event listener when the component unmounts
            return () => {
                messageInput.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, []);


    const BackArrowIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );



    return (
        <div key="1" className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Button className="ml-auto mb-4 absolute top-0 right-0 m-4" size="sm">
                About Us
            </Button>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Enter your ZIP code
                </h1>
                <div className="w-full max-w-sm space-y-2">
                    <form className="flex space-x-2" onSubmit={handleSubmit}>
                        <Input
                            className="max-w-lg flex-1"
                            placeholder="Enter your ZIP code"
                            type="text"
                            value={zipCode}
                            onChange={(e) => {
                                setZipCode(e.target.value)}}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                    {errorMessage && (
                        <div className="text-red-500 ml-2">{errorMessage}</div>
                    )}
                    {successMessage && (
                        <div className="text-green-500 ml-2">{successMessage}</div>
                    )}
                </div>
                <Button type="sendNotification" onClick={async () => {
                    const subscription = await requestNotificationPermission();
                    if (subscription) {
                        const params = new URLSearchParams({
                            // subscription: JSON.stringify(subscription),
                            subscription: JSON.stringify(subscription),
                            payload: "This is a test notification"
                        });
                        try {
                            const response = await fetch("/api/notification-push?" + params);
                            const data = await response.json();
                            console.log(data);
                        } catch (error) {
                            console.error('Error sending notification:', error);
                        }
                    }
                }}>
                    Send Notification
                </Button>
                <div className="w-full max-w-sm space-y-2">
                    <Button className="w-full" onClick={toggleModal}>
                        View Latest News
                    </Button>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={toggleModal}>
                <h2 className="text-3xl font-bold text-center my-4">Latest News</h2>
                {!selectedArticle ? (
                    <ul>
                        {articles.map((article) => (
                            <li key={article.id}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{article.title}</CardTitle>
                                        <CardDescription>{article.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className={style.content}>{article.content}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button size="sm" onClick={() => handleReadMore(article)}>Read More</Button>
                                    </CardFooter>
                                </Card>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>
                        <Button className={style.backButton}
                                onClick={() => setSelectedArticle(null)}>
                        <BackArrowIcon />
                        Back
                    </Button>
                        <div className={style.articleContent}>
                            <div className={style.articleColumns}>
                                <div className={style.articleColumn}>
                                    Some Text In Here
                                </div>
                                <div id="chatWindow" className={style.articleColumn}>
                                </div>
                            </div>
                            <div className={style.articleTextarea}>
                                <input type="text" placeholder="Put something here" className={style.textInput}/>
                                <Button id="sendButton" onClick={processUserMessage}>Send</Button>
                            </div>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    )
}

