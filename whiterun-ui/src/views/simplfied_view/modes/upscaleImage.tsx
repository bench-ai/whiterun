import React, {useState} from 'react'
import {ModeHeader} from "../simplifiedview.styles";
import {UploadContainer, UploadedFileContainer} from "./inpainting.styles";
import {InboxOutlined, PaperClipOutlined, ArrowLeftOutlined, ArrowRightOutlined} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../state/store";
import {appendAsyncImage, reset, del} from "../../../state/mode/modeSlice";
import {Button, Carousel, message} from 'antd';
import {ImageContainer, ImageUploadCarousel} from "./upscaleImage.styles";
import {DeleteOutlined} from "@mui/icons-material";

const UpscaleImage = () => {
    const mode = useSelector((state: RootState) => state.mode.value);

    const [imageURLs, setImageURLs] = useState<string[]>([]);
    const dispatch = useDispatch<AppDispatch>();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files) {

            // Check the limit before adding new images
            if (imageURLs.length + files.length > 5) {
                message.error('Maximum limit reached. You can upload at most 5 images.');
                return;
            }

            // dispatch(reset());

            // Iterate through the selected files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                if (file instanceof Blob) {
                    dispatch(appendAsyncImage(file));
                    setImageURLs((prevURLs) => [...prevURLs, URL.createObjectURL(file)]);
                }
            }
        }
    };

    const handleDeleteImage = (index: number) => {
        dispatch(del(index));
        const updatedURLs = [...imageURLs];
        updatedURLs.splice(index, 1);
        setImageURLs(updatedURLs);
    };

    return (
        <div>
            <ModeHeader>Upload Image</ModeHeader>
            <UploadContainer>
                <label htmlFor="fileInput">
                    <InboxOutlined style={{ fontSize: '50px', color: '#39a047' }} />
                    <h2 style={{ color: '#c0c1c2', fontSize: '18px' }}>
                        Click in this area to upload files
                    </h2>
                    <p style={{ color: '#5c5f63', fontSize: '14px' }}>Accepts .jpg & .png files</p>
                    <input
                        id="fileInput"
                        className="file-input"
                        type="file"
                        accept=".jpg, .jpeg, .png"
                        onChange={(e) => handleFileChange(e)}
                        multiple  // Allow multiple file selection
                    />
                </label>
            </UploadContainer>
            <UploadedFileContainer visible={mode.image.length > 0}>
                {imageURLs.length > 0 && (
                    <ImageUploadCarousel
                        key={imageURLs.join()}  // Add a key to force re-render when imageURLs changes
                        arrows
                        nextArrow={<ArrowRightOutlined />}
                        prevArrow={<ArrowLeftOutlined />}
                    >
                        {imageURLs.map((url, index) => (
                            <ImageContainer key={index}>
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    style={{ zIndex: "3" }}
                                    onClick={() => handleDeleteImage(index)}
                                />
                                <img
                                    src={url}
                                    alt={`Uploaded ${index + 1}`}
                                    style={{ display: 'block', margin: '0 auto', maxWidth: '50%' }}
                                />
                            </ImageContainer>
                        ))}
                    </ImageUploadCarousel>
                )}
            </UploadedFileContainer>
        </div>
    );
};

export default UpscaleImage;