import Image from "next/image";

export default function About() {
    return (
        <div>
            <div className="font-bold text-4xl mt-14 ml-16">About Pulsify</div>
            <div className="w-[1020px] h-[205px] p-5 space-y-3 bg-[#5F5F5F] rounded-2xl ml-16 mt-5 mb-14">
                <h1 className="font-bold text-4xl">What is Pulsify</h1>
                <p className="text-2xl">
                    Pulsify is a free open-source web app that aims to be a beginner’s
                    <br />
                    first audio remix service. It’s a simplified mixing board powered by
                    <br />
                    machine learning and the Spotify API.
                </p>
            </div>
            <div className="w-[1020px] h-[205px] p-5 space-y-3 bg-[#5F5F5F] rounded-2xl ml-16 mt-5 mb-14">
                <h1 className="font-bold text-4xl">Where can I find the repo?</h1>
                <p className="text-2xl">
                    You can check any of the Developers' Github
                    <br />
                    profiles to find the repository. The project is
                    <br />
                    open-source and available to the public.
                </p>
            </div>
            <section className="p-16 bg-black">
                <div className="space-y-9">
                    <h1 className="font-bold text-4xl">Pulsify Developers</h1>
                    <p className="text-2xl">Frontend Developer</p>
                    <p className="font-bold text-xl">Jeffrey Rivera</p>
                    <div className="flex space-x-24">
                        <a href="https://github.com/JeffRiveraG" target="_blank" rel="noopener noreferrer">
                            <Image
                                src="/images/github logo.svg"
                                alt="github"
                                width={50}
                                height={50}
                            />
                        </a>
                        <Image
                            src="/images/email logo.svg"
                            alt="email"
                            width={50}
                            height={50}
                        />
                    </div>
                    <Image
                        src="/images/mememe.jpg"
                        alt="Jeff"
                        width={288}
                        height={288}
                        className="rounded-2xl"
                    />
                    <p className="text-2xl">Backend Developers</p>
                    <div>
                        <div className="flex flex-row space-x-24">
                            <div className="flex flex-col space-y-9">
                                <p className="font-bold text-xl">Alex Reyes</p>
                                <div className="flex space-x-24">
                                    <a href="https://github.com/Alex-R-Projects" target="_blank" rel="noopener noreferrer">
                                        <Image
                                            src="/images/github logo.svg"
                                            alt="github"
                                            width={50}
                                            height={50}
                                        />
                                    </a>
                                    <Image
                                        src="/images/email logo.svg"
                                        alt="email"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <Image
                                    src="/images/Alex.jpg"
                                    alt="Alex"
                                    width={288}
                                    height={288}
                                    className="rounded-2xl"
                                />
                            </div>
                            <div className="flex flex-col space-y-9">
                                <p className="font-bold text-xl">Raja Pradhan</p>
                                <div className="flex space-x-24">
                                    <a href="https://github.com/Rpradhan43" target="_blank" rel="noopener noreferrer">
                                        <Image
                                            src="/images/github logo.svg"
                                            alt="github"
                                            width={50}
                                            height={50}
                                        />
                                    </a>
                                    <Image
                                        src="/images/email logo.svg"
                                        alt="email"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <Image
                                    src="/images/Raja.jpg"
                                    alt="Raja"
                                    width={288}
                                    height={288}
                                    className="rounded-2xl"
                                />
                            </div>
                            <div className="flex flex-col space-y-9">
                                <p className="font-bold text-xl">Jonathan Fagoaga</p>
                                <div className="flex space-x-24">
                                    <a href="https://github.com/Foggy1365" target="_blank" rel="noopener noreferrer">
                                        <Image
                                            src="/images/github logo.svg"
                                            alt="github"
                                            width={50}
                                            height={50}
                                        />
                                    </a>
                                    <Image
                                        src="/images/email logo.svg"
                                        alt="email"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <Image
                                    src="/images/johnathan.jpg"
                                    alt="Johnathan"
                                    width={288}
                                    height={288}
                                    className="rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}