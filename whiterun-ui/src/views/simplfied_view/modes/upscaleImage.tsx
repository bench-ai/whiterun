import React, {useState} from 'react'
import {ModeHeader} from "../simplifiedview.styles";
import {UploadContainer, UploadedFileContainer} from "./inpainting.styles";
import {InboxOutlined, PaperClipOutlined} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../state/store";
import {appendAsyncImage, reset, del} from "../../../state/mode/modeSlice";

const UpscaleImage = () => {

    const mode = useSelector((state: RootState) => state.mode.value);

    // const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            if (file instanceof Blob) {
                dispatch(reset())
                dispatch(appendAsyncImage(file))
                // setUploadedImageFile(file);
                setImageURL(URL.createObjectURL(file));
            }
        }
    };

    return (
        <div>
            <ModeHeader>Upload Image</ModeHeader>
            <UploadContainer>
                <label htmlFor="fileInput">
                    <InboxOutlined style={{fontSize: "50px", color: "#39a047"}}/>
                    <h2 style={{color: "#c0c1c2", fontSize: "18px"}}>Click in this area to upload a file</h2>
                    <p style={{color: "#5c5f63", fontSize: "14px"}}>Accepts .jpg & .png files</p>
                    <input
                        id="fileInput"
                        className="file-input"
                        type="file"
                        accept=".jpg, .jpeg, .png"
                        onChange={(e) => handleFileChange(e)}
                    />
                </label>
            </UploadContainer>
            <UploadedFileContainer visible={mode.image.length > 0}>
                <PaperClipOutlined style={{marginRight: "15px"}}/>
                {/*Uploaded File: {uploadedImageFile !== null ? uploadedImageFile.name : 'No file uploaded'}*/}
                <div>
                    {imageURL && (
                        <div>
                            <img
                                src={imageURL}
                                alt="Uploaded"
                                style={{display: 'block', margin: '0 auto', maxWidth: '50%'}}
                            />
                        </div>
                    )}
                </div>
            </UploadedFileContainer>
        </div>
    );
};

export default UpscaleImage;