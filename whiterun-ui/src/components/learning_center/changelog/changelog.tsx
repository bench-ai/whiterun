import React from "react";
import Title from "antd/es/typography/Title";
import {CustomTimeline} from "./changelog_styles";

const Changelog = () => {

    const items = [
        {
            label: 'March 7th, 2024', children:
            <>
                <b>Simplified Workflows with Workbench Lite and more!</b>
                <p>
                    This update marks a huge update as we add a new major feature called Workbench Lite. This allows for users
                    to have most of the functionality that the full Workbench / workflow builder has but in a much simpler format. This should
                    make it easier for users to generate an image without having to build an entire workflow to do so. We still
                    recommend the Workbench / workflow builder for users that want to have a repeatable workflow and more
                    fine-tuning over their image generation process.
                </p>
                <p>
                    Some other updates include the learning center, a hub for helping users learn the various tools that Bench AI
                    has to offer. This can be accessed when building a workflow and hitting the green question mark
                    button in the top right of the board. It can also be accessed through the simplified workbench in the
                    bottom right corner of the screen. We've also added zoom controls to give users other option to navigate
                    the board when building workflows.
                </p>
                <p>Full list of changes below:</p>
                <ul>
                    <li>Added the Workbench Lite</li>
                    <ul>
                        <li>Adds most of the functionality of the full Workbench but in a simpler UI.</li>
                        <li>Allows users to easily modify or create multiple images, using up to 5 model generators at the same
                        time for single images.</li>
                        <li>Users can look at the settings used for a generated image to see which settings generated the best
                        images.</li>
                        <li>After generating an image, users can continue with the newly made image as the base image
                        for another image operation, making it easy to do end-to-end image workflows without any friction.</li>
                    </ul>
                    <li>Added the Learning Hub</li>
                    <li>Added changelog which can be found in Learning Hub</li>
                    <li>Added zoom controls to board</li>
                </ul>
            </>
        },
        {
            label: 'February 19, 2024', children:
                <>
                    <b>Chat GPT and Image to Video Added, Sharable Workflows, and More!</b>
                    <p>
                        This update marks the biggest update we've made to Bench AI since we first launched.
                        The biggest updates being that we've added an influx of new operators for users to use such as
                        ChatGPT and adding a Promptmaker Operator. The Promptmaker should prove useful for those who
                        aren't prompt engineers as it turns simple prompts into complex ones. This should make
                        generating
                        detailed images much easier. We've also added an Image to Video Operator to convert still images
                        into
                        short couple second animated clips. We've also made it show all workflows are sharable, all you
                        need to do
                        is copy the link of the workflow you currently on and that's it!
                    </p>
                    <p>We've also added some other quality of life updates,
                        the full changes are listed below:</p>
                    <ul style={{marginTop: "10px"}}>
                        <li>Added ChatGPT Operator</li>
                        <li>Added Promptmaker Operator</li>
                        <li>Added Image to Video Operator</li>
                        <li>Added a loading animation indicator to when user hits play button to indicate workflow
                            processing
                        </li>
                        <li>Revised tooltips</li>
                        <li>Minor bug fixes</li>
                    </ul>
                </>
        },
        {
            label: 'February 11, 2024', children:
                <>
                    <b>Transform portraits into any art style! Added Masking Operators</b>
                    <p>
                        For this update, we've added the Photomaker Operator. Ever wanted to see how a sketch of a
                        historical
                        artists such as Leonardo da Vinci would look like in real life or how you would look like in a
                        comic book style? Well
                        wonder no more with the Photomaker Operator! This operator allows users to upload any portrait
                        of
                        any person and it allows the user to transform it into any art style.
                    </p>
                    <p>
                        We've also added various masking operators for the various text to image operators. This allows
                        users to
                        change specific parts of an image and fill it with new parts using generative AI. This should
                        make getting
                        that perfect image much easier through fine tuning.
                    </p>
                    <p>
                        Full list of changes below:
                    </p>
                    <ul style={{marginTop: "10px"}}>
                        <li>Added Photomaker Operator</li>
                        <li>Added RealVisXL Masking Operator</li>
                        <li>Added Text to Image Masking Operator</li>
                        <li>Added Mask maker to Image Operator</li>
                        <li>Bug Fixes</li>
                    </ul>
                </>
        },
        {
            label: 'January 21st, 2024', children:
                <>
                    <b>Added Dall-E, RealVisXL, and New Upscaler Operators!</b>
                    <p>
                        For this update, we've added OpenAI's Dall-E image generator which is great in generating
                        general
                        image generation. The RealVisXL operator is more focused towards generating realistic
                        images. We've also added a ControlNet Tile Upscaler which has a lot more fine tuning options
                        compared
                        to the normal upscaler we had and generally does a better job of upscaling.
                    </p>
                    <p>
                        Full list of changes below:
                    </p>
                    <ul style={{marginTop: "10px"}}>
                        <li>Added Dall-E Operator</li>
                        <li>Added RealVisXL Operator</li>
                        <li>Added ControlNet Tile Upscale Operator</li>
                        <li>Bug fixes</li>
                    </ul>
                </>
        },

    ];

    return (
        <div>
            <Title level={1} style={{marginTop: "0px", marginBottom: "5px"}}>Changelog</Title>
            <p style={{margin: "0 0 30px 0"}}>Timeline of updates to Bench AI</p>
            <div style={{display: "flex", justifyContent: "left"}}>
                <CustomTimeline mode={"left"} items={items} style={{marginLeft: 0}}/>
            </div>
        </div>
    );
}

export default Changelog;