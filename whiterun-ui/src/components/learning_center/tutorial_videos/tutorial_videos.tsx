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
import ThumbnailSimplifiedTextToImage from "../../../assets/thumbnails/thumbnailSimplifiedTextToImage.png";
import ThumbnailSimplifiedImageToImage from "../../../assets/thumbnails/thumbnailSimplifiedImageToImage.png";
import ThumbnailSimplifiedInpainting from "../../../assets/thumbnails/thumbnailSimplifiedInpainting.png";
import ThumbnailSimplifiedUpscale from "../../../assets/thumbnails/thumbnailSimplifiedUpscale.png";

const TutorialVideos = () => {

    const videoData = [
        {
            videoLink: "https://drive.google.com/file/d/1S41O2RKFBn8f6_o2eF2pFswwLBquUHHJ/view?usp=drive_link",
            thumbnailSrc: ThumbnailPhotomaker,
            type: "Video",
            heading: "Learn to use the Photomaker Operator",
        },
        {
            videoLink: "https://drive.google.com/file/d/1dS_CHr6fn1SsDnhD53GgxLawf8T_z_ps/view?usp=drive_link",
            thumbnailSrc: ThumbnailImageToImage,
            type: "Video",
            heading: "Learn to use the Image to Image Operator",
        },
        {
            videoLink: "https://drive.google.com/file/d/1mTP8Q75CfuxhwmmXJsyAKpB5tuWEoHYc/view?usp=drive_link",
            thumbnailSrc: ThumbnailMasking,
            type: "Video",
            heading: "Learn how to mask images using tools inside the Image Operator",
        },
        {
            videoLink: "https://drive.google.com/file/d/1_2jw0TcnGBkWI3G-AXA3LH7O-0T9IsQ7/view?usp=drive_link",
            thumbnailSrc: ThumbnailPromptmaker,
            type: "Video",
            heading: "Learn to use the Promptmaker to Generate Amazing Prompts",
        },
        {
            videoLink: "https://drive.google.com/file/d/1E79H1-Sr5-zi9LN7zi_Sg1B3thdUDqxE/view?usp=drive_link",
            thumbnailSrc: ThumbnailRealVisXL,
            type: "Video",
            heading: "Learn to use the RealVisXL Operator to Generate Realistic Images",
        },
        {
            videoLink: "https://drive.google.com/file/d/13vC18xsa5LzDDNamh3oKVYu-NeVnyenR/view?usp=drive_link",
            thumbnailSrc: ThumbnailUpscaler,
            type: "Video",
            heading: "Learn to use the Upscale Operator to Improve Image Quality",
        },
    ];

    const videoDataSimple = [
        {
            videoLink: "https://drive.google.com/file/d/1kITfihcKe1jQIHcNsNn1fSmMrRQZN5Zv/view?usp=drive_link",
            thumbnailSrc: ThumbnailSimplifiedTextToImage,
            type: "Video",
            heading: "Learn to use the Simplified Text to Image Mode",
        },
        {
            videoLink: "https://drive.google.com/file/d/1NEEm_5wv-gvFOG3BmsulMZKIB56Tit4a/view?usp=drive_link",
            thumbnailSrc: ThumbnailSimplifiedImageToImage,
            type: "Video",
            heading: "Learn to use the Simplified Image to Image Mode",
        },
        {
            videoLink: "https://drive.google.com/file/d/1pq0Se-Sl5whJa0-xYpdlGsAQU8UwB0dL/view?usp=drive_link",
            thumbnailSrc: ThumbnailSimplifiedInpainting,
            type: "Video",
            heading: "Learn to use the Simplified Inpainting Mode",
        },
        {
            videoLink: "https://drive.google.com/file/d/1V1vLUdGTfouevSSJufuxICxzjA6ljCme/view?usp=drive_link",
            thumbnailSrc: ThumbnailSimplifiedUpscale,
            type: "Video",
            heading: "Learn to use the Simplified Upscaling Mode",
        }
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

            <div style={{marginTop: "50px", marginBottom: "30px"}}>
                <Title level={1} style={{marginTop: "0px", marginBottom: "5px"}}>Learn the Various Modes in Our Simplified Workbench</Title>
                <p style={{margin: 0}}>Get comfortable in Simplified End-to-End Image Generation</p>
            </div>

            <VideoList>
                {videoDataSimple.map((video, index) => (
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