import React, {useEffect, useState} from 'react';
import {
    BrushTitle,
    EditButton,
    EditorButtonColumn,
    ImageEditor,
    ImageEditorSlider, MaskEditorTitle, SaveButton,
    UploadContainer, UploadedFileContainer
} from './inpainting.styles';
import {ButtonRow, ModeButton, ModeHeader} from '../simplifiedview.styles';
import {ArrowLeftOutlined, ArrowRightOutlined, InboxOutlined, PaperClipOutlined} from '@ant-design/icons';
import {appendAsyncImage, appendAsyncMask, del, delMask} from "../../../state/mode/modeSlice";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../state/store";
import {Button, message} from "antd";
import {ImageContainer, ImageUploadCarousel} from "./upscaleImage.styles";
import {DeleteOutlined} from "@mui/icons-material";
import {downloadImage} from "../generate/requests/uploadImage";

const SimplifiedInpainting = () => {
    const [brushSize, setBrushSize] = useState<number>(5);
    const [imageURLs, setImageURLs] = useState<string[]>([]);
    const [maskImageURLs, setMaskImageURLs] = useState<string[]>([]);
    const [editedMaskFileUrl, setEditedMaskFileUrl] = useState<string>("");
    const dispatch = useDispatch<AppDispatch>();
    const mode = useSelector((state: RootState) => state.mode.value);
    const generatorsMap = useSelector((state: RootState) => state.generator.value);

    useEffect(() => {
        document.title = 'Workbench Lite - Bench AI';
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files) {

            if (Object.keys(generatorsMap).length > 1 && ((imageURLs.length > 0) || (files.length > 1))){
                message.error('Maximum limit reached. You can upload at most 1 images. When' +
                    ' using more than one generator');
                return;
            }

            // Check the limit before adding new images
            if (mode.image.length + files.length > 1) {
                message.error('Maximum limit reached. You can upload at most 1 images.');
                return;
            }

            // Iterate through the selected files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file instanceof Blob) {
                    dispatch(appendAsyncImage(file));
                }
            }
        }
    };

    useEffect(() => {
        // Delete all images except the first one
        if (mode.image.length > 1) {
            const deletedImages = mode.image.slice(1);
            deletedImages.forEach((imageKey) => {
                dispatch(del(mode.image.indexOf(imageKey)));
            });
        }
    }, [mode.image]);

    useEffect(() => {

        const imageFunc = async () => {
            if (mode.image.length == 1) {
                const response = await downloadImage(mode.image[0]);
                if (response.response) {
                    setEditedMaskFileUrl(response.response);
                    imageEditor(response.response);
                }
            }
        };

        imageFunc();
    }, [mode.image]);

    const handleDeleteImage = (index: number) => {
        dispatch(del(index));
        const updatedURLs = [...imageURLs];
        updatedURLs.splice(index, 1);
        setImageURLs(updatedURLs);
    };

    useEffect(() => {

        const imagePromiseFunc = async () => {
            const promiseArr = mode.image.map((key) => {
                return downloadImage(key)
            })

            const stringArr: string[] = []

            for (const key of promiseArr) {
                const response = (await key)
                if (response.response){
                    stringArr.push(response.response)
                }else{
                    stringArr.push("")
                }
            }

            setImageURLs(stringArr)
        }

        imagePromiseFunc()

    }, [mode.image]);

    const handleMaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files) {

            if (Object.keys(generatorsMap).length > 1 && ((maskImageURLs.length > 0) || (files.length > 1))){
                message.error('Maximum limit reached. You can upload at most 1 images. When' +
                    ' using more than one generator');
                return;
            }

            // Check the limit before adding new images
            if (mode.mask) {
                if (mode.mask.length + files.length > 1) {
                    message.error('Maximum limit reached. You can upload at most 5 images.');
                    return;
                }
            }

            // Iterate through the selected files
            for (let i = 0; i < 1; i++) {
                const file = files[i];
                if (file instanceof Blob) {
                    dispatch(appendAsyncMask(file));
                }
            }
        }
    };

    const handleDeleteMaskImage = (index: number) => {
        dispatch(delMask());
        const updatedURLs = [...imageURLs];
        updatedURLs.splice(index, 1);
        setMaskImageURLs(updatedURLs);
    };

    useEffect(() => {
        const imagePromiseFunc = async () => {
            if (mode.mask) {
                const response = await downloadImage(mode.mask);

                if (response.response) {
                    setMaskImageURLs([response.response]);
                } else {
                    setMaskImageURLs([""]);
                }
            }
        };

        imagePromiseFunc();
    }, [mode.mask]);


    const resetView = () => {
        addView("createMask")
    }

    const imageEditor = (file: string) => {
        const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
        const canvas2 = document.getElementById('myCanvas2') as HTMLCanvasElement;
        const outputCanvas = document.getElementById('outputCanvas') as HTMLCanvasElement;
        const ctx = (canvas.getContext('2d') as CanvasRenderingContext2D);
        const ctx2 = (canvas2.getContext('2d') as CanvasRenderingContext2D);
        const outputCtx = (outputCanvas.getContext('2d') as CanvasRenderingContext2D);
        const brushSizeSlider = document.getElementById('brushSizeSlider') as HTMLInputElement;
        // const toggleCanvasButton = document.getElementById('toggleCanvasButton') as HTMLButtonElement;
        // const flipColorsButton = document.getElementById('flipColorsButton') as HTMLButtonElement;
        const resetButton = document.getElementById('resetButton') as HTMLButtonElement;
        const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement;
        const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
        let img = new Image();
        let isDrawing = false;
        let brushSize = 5; // Initial brush size
        let lastX: number | undefined, lastY: number | undefined;

        let editedMaskImage;

        img.src = file;

        // Ensure the image is loaded before drawing on the canvas
        img.onload = function () {
            // Calculate the width and height based on the aspect ratio
            const aspectRatio = img.width / img.height;
            const maxWidth = window.innerWidth * 0.5; // 50% of the screen's width
            const maxHeight = window.innerHeight * 0.5; // 70% of the screen's height

            let canvasWidth, canvasHeight;

            if (aspectRatio > 1) {
                // Landscape image
                canvasWidth = Math.min(img.width, maxWidth);
                canvasHeight = canvasWidth / aspectRatio;
            } else {
                // Portrait image
                canvasHeight = Math.min(img.height, maxHeight);
                canvasWidth = canvasHeight * aspectRatio;
            }

            // Set the calculated width and height for both canvases
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            canvas2.width = canvasWidth;
            canvas2.height = canvasHeight;
            outputCanvas.width = img.width;
            outputCanvas.height = img.height;

            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            ctx2.fillStyle = "white"; // Set to the same background color as canvas2
            ctx2.fillRect(0, 0, canvasWidth, canvasHeight);

            // Handle mouse events for continuous brush effect
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            brushSizeSlider.addEventListener('input', brushSizeInputListener);
            resetButton.addEventListener('click', resetButtonClickHandler);
            downloadButton.addEventListener('click', downloadButtonClickHandler);
            saveButton.addEventListener('click', saveButtonClickHandler);
            // toggleCanvasButton.addEventListener('click', toggleCanvasButtonClickHandler);
            // flipColorsButton.addEventListener('click', flipColorsButtonClickHandler);
        };

        const closeButton = document.querySelector('.file-input');
        // @ts-ignore
        closeButton.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            brushSizeSlider.removeEventListener('input', brushSizeInputListener);
            resetButton.removeEventListener('click', resetButtonClickHandler);
            downloadButton.removeEventListener('click', downloadButtonClickHandler);
            saveButton.removeEventListener('click', saveButtonClickHandler);
            // toggleCanvasButton.removeEventListener('click', toggleCanvasButtonClickHandler);
            // flipColorsButton.removeEventListener('click', flipColorsButtonClickHandler);
        });


        function startDrawing(event: any) {
            isDrawing = true;
            draw(event);
        }

        function draw(event: { offsetX: any; offsetY: any; }) {
            if (!isDrawing) return;

            const x = event.offsetX;
            const y = event.offsetY;

            // Draw on the first canvas
            ctx.fillStyle = "black"; // Set the color for drawing (you can customize the color)
            ctx.beginPath();
            ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
            ctx.fill();

            // Draw on the second canvas
            ctx2.fillStyle = "black"; // Set the color for drawing (you can customize the color)
            ctx2.beginPath();
            ctx2.arc(x, y, brushSize, 0, 2 * Math.PI);
            ctx2.fill();

            // Connect consecutive points with a line on myCanvas2
            if (lastX !== undefined && lastY !== undefined) {
                ctx2.beginPath();
                ctx2.moveTo(lastX, lastY);
                ctx2.lineTo(x, y);
                ctx2.lineWidth = brushSize * 2;
                ctx2.stroke();
                ctx2.closePath();

                // Draw a filled circle on myCanvas2
                ctx2.beginPath();
                ctx2.arc(x, y, brushSize, 0, 2 * Math.PI);
                ctx2.fill();
            }

            // Connect consecutive points with a line on myCanvas
            if (lastX !== undefined && lastY !== undefined) {
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.lineWidth = brushSize * 2;
                ctx.stroke();
                ctx.closePath();

                // Draw a filled circle on myCanvas
                ctx.beginPath();
                ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
                ctx.fill();
            }

            lastX = x;
            lastY = y;
        }

        function stopDrawing() {
            isDrawing = false;
            lastX = undefined;
            lastY = undefined;
        }

        // Define the brush size input listener
        function brushSizeInputListener() {
            // Update the brush size when the slider value changes
            brushSize = parseInt(brushSizeSlider.value, 10);
            setBrushSize(brushSize);
        }

        // Define the reset button click handler
        function resetButtonClickHandler() {
            // Clear both canvases
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

            // Redraw the image on the first canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Set the background color for the second canvas
            ctx2.fillStyle = "white";
            ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
        }

        // Define the download button click handler
        function downloadButtonClickHandler() {
            // Create a data URL representing the contents of canvas2
            outputCtx.drawImage(canvas2, 0, 0, outputCanvas.width, outputCanvas.height);
            const dataURL = outputCanvas.toDataURL("image/png");

            // Create a download link
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'mask_file.png';
            a.click();
        }

        function saveButtonClickHandler() {
            // Create a data URL representing the contents of canvas2
            outputCtx.drawImage(canvas2, 0, 0, outputCanvas.width, outputCanvas.height);
            const dataURL = outputCanvas.toDataURL("image/png");

            // Convert data URL to Blob
            const byteString = atob(dataURL.split(',')[1]);
            const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const editedMaskBlob = new Blob([ab], { type: mimeString });
            const editedMaskFile = new File([editedMaskBlob], 'maskImage.png', { type: mimeString });
            try {
                dispatch(appendAsyncMask(editedMaskFile))
                message.open(
                    {
                        type: "success",
                        content: "Mask saved!",
                    }
                )
            } catch (error) {
                message.open({
                    type: 'error',
                    content: 'Error saving mask. Please try again.',
                });
            }

            // Set the edited mask file in the state
            // setEditedMaskFileUrl(URL.createObjectURL(editedMaskBlob));
        }



        // Define the toggle canvas button click handler
        function toggleCanvasButtonClickHandler() {
            if (canvas.style.display === 'none') {
                canvas.style.display = 'block';
                canvas2.style.display = 'none';
            } else {
                canvas.style.display = 'none';
                canvas2.style.display = 'block';
            }
        }

        // Define the flip colors button click handler
        function flipColorsButtonClickHandler() {
            // Flip the colors of canvas2
            const currentFillColor = ctx2.fillStyle;
            const currentImageData = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);

            // Change the background color to black
            ctx2.fillStyle = "black";
            ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

            // Iterate through the pixel data and invert the color
            for (let i = 0; i < currentImageData.data.length; i += 4) {
                currentImageData.data[i] = 255 - currentImageData.data[i]; // Red
                currentImageData.data[i + 1] = 255 - currentImageData.data[i + 1]; // Green
                currentImageData.data[i + 2] = 255 - currentImageData.data[i + 2]; // Blue
            }

            // Update canvas2 with the modified pixel data
            ctx2.putImageData(currentImageData, 0, 0);

            // Restore the original fill color
            ctx2.fillStyle = currentFillColor;
        }
    };


    const [selectedMode, setSelectedMode] = useState("");

    function addView(currentMode: string) {
        const previousMode = document.getElementById(selectedMode);
        const mode = document.getElementById(currentMode);

        if (previousMode) {
            previousMode.style.color = 'black';
            previousMode.style.background = 'white';
        }

        if (mode) {
            mode.style.background = '#53389E';
            mode.style.color = 'white';
        }

        switch (currentMode) {
            case "createMask":
                break;
            case "uploadMask":
                break;
            default:
                break;
        }

        setSelectedMode(currentMode);
    }

    useEffect(() => {
        addView("createMask");
    }, []);

    const renderMaskEditor = () => {
        // Your mask editor JSX goes here
        return (
            <ImageEditor>
                <div style={{display: "flex", flexWrap: "wrap"}}>
                    <EditorButtonColumn>
                        <MaskEditorTitle>Mask Editor</MaskEditorTitle>
                        <EditButton id="resetButton">Reset Edits</EditButton>
                        {/*<EditButton id="toggleCanvasButton">Toggle Mask Preview</EditButton>*/}
                        {/*<EditButton id="flipColorsButton">Flip Mask Output Color</EditButton>*/}
                        <div style={{marginTop: "10px"}}>
                            <BrushTitle htmlFor="brushSizeSlider">Brush Size:</BrushTitle>
                            <ImageEditorSlider type="range" className="modal-editor-slider" id="brushSizeSlider" min="1"
                                               max="20"
                                               step="1" value={brushSize}/>
                        </div>
                        <div style={{marginTop: "auto"}}>
                            <EditButton id="downloadButton">Download Edits</EditButton>

                            <SaveButton id="saveButton">Save Edits</SaveButton>
                        </div>
                    </EditorButtonColumn>
                    <div>
                        <canvas id="myCanvas" width="400" height="400" style={{border: "1px solid #000"}}></canvas>
                        <canvas id="myCanvas2" width="400" height="400"
                                style={{border: "1px solid #000", display: "none"}}></canvas>
                        <canvas id="outputCanvas" width="400" height="400"
                                style={{border: "1px solid #000", display: "none"}}></canvas>
                    </div>
                </div>
            </ImageEditor>
        );
    };



    const renderUploadArea = () => {
        // Your upload area JSX goes here
        return (
            <div style={{margin: "auto", minWidth: "300px", maxWidth: "60%"}}>
                <UploadContainer style={{marginTop: "20px"}}>
                    <label htmlFor="maskInput">
                        <InboxOutlined style={{ fontSize: '50px', color: '#39a047' }} />
                        <h2 style={{ color: '#c0c1c2', fontSize: '18px' }}>
                            Click in this area to upload a masking file
                        </h2>
                        <p style={{ color: '#5c5f63', fontSize: '14px' }}>Accepts a .jpg or .png file</p>
                        <input
                            id="maskInput"
                            className="mask-input"
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            onChange={(e) => handleMaskFileChange(e)}
                            multiple  // Allow multiple file selection
                        />
                    </label>
                </UploadContainer>

                <UploadedFileContainer visible={!!(mode.mask && mode.mask.length > 0)}>
                    {mode.mask && mode.mask.length > 0 && (
                        <ImageUploadCarousel
                            arrows
                            nextArrow={<ArrowRightOutlined />}
                            prevArrow={<ArrowLeftOutlined />}
                        >
                            {maskImageURLs.map((url, index) => (
                                <ImageContainer key={index}>
                                    <Button
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        style={{ zIndex: "3" }}
                                        onClick={() => handleDeleteMaskImage(index)}
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

    return (
        <div>
            <ModeHeader>Upload Image</ModeHeader>
            <UploadContainer>
                <label htmlFor="fileInput">
                    <InboxOutlined style={{ fontSize: '50px', color: '#39a047' }} />
                    <h2 style={{ color: '#c0c1c2', fontSize: '18px' }}>
                        Click in this area to upload file
                    </h2>
                    <p style={{ color: '#5c5f63', fontSize: '14px' }}>Accepts a .jpg or .png file</p>
                    <input
                        id="fileInput"
                        className="file-input"
                        type="file"
                        accept=".jpg, .jpeg, .png"
                        onChange={(e) => handleFileChange(e)}
                        onClick={resetView}
                        multiple  // Allow multiple file selection
                    />
                </label>
            </UploadContainer>

            <UploadedFileContainer visible={mode.image.length > 0}>
                {mode.image.length > 0 && (
                    <ImageUploadCarousel
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
            <ModeHeader>Mask</ModeHeader>
            <ButtonRow>
                <ModeButton id="createMask" onClick={() => addView('createMask')} style={{marginRight: "20px"}}><b>Create
                    a
                    Mask</b></ModeButton>
                <ModeButton id="uploadMask" onClick={() => addView('uploadMask')} style={{marginRight: "20px"}}><b>Upload
                    a
                    Mask</b></ModeButton>
            </ButtonRow>
            {selectedMode === 'createMask' ? renderMaskEditor() : null}
            {selectedMode === 'uploadMask' ? renderUploadArea() : null}

        </div>
    );
};

export default SimplifiedInpainting;
