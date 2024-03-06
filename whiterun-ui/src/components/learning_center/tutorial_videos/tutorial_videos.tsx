import React from "react";
import Title from "antd/es/typography/Title";
import {
    CenteredPlayButton,
    SmallHeading,
    SmallHeadingSection,
    TutorialThumbnail,
    VideoCard,
    VideoContainer,
    VideoList
} from "./tutorial_videos.styles";
import {PlayCircleFilled} from "@mui/icons-material";
import Paragraph from "antd/es/typography/Paragraph";
import ThumbnailImageToImage from "../../../assets/thumbnails/thumbnailImageToImage.png";
import ThumbnailPhotomaker from "../../../assets/thumbnails/thumbnailPhotomaker.png";
import ThumbnailMasking from "../../../assets/thumbnails/thumbnailMasking.png";
import ThumbnailPromptmaker from "../../../assets/thumbnails/thumbnailPromptmaker.png";
import ThumbnailRealVisXL from "../../../assets/thumbnails/thumbnailRealVisXL.png";
import ThumbnailUpscaler from "../../../assets/thumbnails/thumbnailUpscaler.png";

const TutorialVideos = () => {

    const videoData = [
        {
            videoLink: "",
            thumbnailSrc: ThumbnailPhotomaker,
            type: "Video",
            heading: "Learn to use the Photomaker Operator",
        },
        {
            videoLink: "",
            thumbnailSrc: ThumbnailImageToImage,
            type: "Video",
            heading: "Learn to use the Image to Image Operator",
        },
        {
            videoLink: "",
            thumbnailSrc: ThumbnailMasking,
            type: "Video",
            heading: "Learn how to mask images using tools inside the Image Operator",
        },
        {
            videoLink: "",
            thumbnailSrc: ThumbnailPromptmaker,
            type: "Video",
            heading: "Learn to use the Promptmaker to Generate Amazing Prompts",
        },
        {
            videoLink: "",
            thumbnailSrc: ThumbnailRealVisXL,
            type: "Video",
            heading: "Learn to use the RealVisXL Operator to Generate Realistic Images",
        },
        {
            videoLink: "",
            thumbnailSrc: ThumbnailUpscaler,
            type: "Video",
            heading: "Learn to use the Upscale Operator to Improve Image Quality",
        },
    ];

    return (
        <div>
            <div style={{marginBottom: "30px"}}>
                <Title level={1} style={{marginTop: "0px", marginBottom: "5px"}}>Learn the Various Operators</Title>
                <p style={{margin: 0}}>Get comfortable in creating powerful workflows</p>
            </div>

            <VideoList>
                {videoData.map((video, index) => (
                    <VideoContainer key={index}>
                        <a
                            href={video.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <VideoCard
                                hoverable
                                bordered={false}
                                style={{maxWidth: 300, position: "relative"}}
                            >
                                <TutorialThumbnail
                                    src={video.thumbnailSrc}
                                    alt="uh oh"
                                />
                                <CenteredPlayButton>
                                    <PlayCircleFilled style={{fontSize: "60px"}}/>
                                </CenteredPlayButton>
                            </VideoCard>
                        </a>
                        <SmallHeadingSection
                            onClick={() =>
                                window.open(video.videoLink, "_blank")
                            }
                        >
                            <SmallHeading>
                                {video.type}
                            </SmallHeading>
                            <Paragraph
                                style={{
                                    fontSize: "14px",
                                    marginBottom: 0,
                                    fontWeight: "bold",
                                    lineHeight: "18px"
                                }}
                            >
                                {video.heading}
                            </Paragraph>
                        </SmallHeadingSection>
                    </VideoContainer>
                ))}
            </VideoList>
        </div>
    );
};

export default TutorialVideos;