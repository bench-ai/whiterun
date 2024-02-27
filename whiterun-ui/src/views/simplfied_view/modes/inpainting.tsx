import React, { useEffect, useState } from 'react';
import {
    EditButton,
    EditorButtonColumn,
    ImageEditor,
    ImageEditorSlider,
    StyledCheckableTag
} from './inpainting.styles';
import { ButtonRow, ModeHeader } from '../simplifiedview.styles';
import { message, Tag, Upload, UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const SimplifiedInpainting = () => {
    const { CheckableTag } = Tag;
    const tagsData = ['RealVisXL', 'SDXL'];
    const [selectedTags, setSelectedTags] = useState<string[]>(['Books']);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Workbench Lite - Bench AI';
    }, []);

    const handleChange = (tag: string, checked: boolean) => {
        const nextSelectedTags = checked
            ? [...selectedTags, tag]
            : selectedTags.filter((t) => t !== tag);
        setSelectedTags(nextSelectedTags);
    };

    const showEditModal = (file: Blob | MediaSource) => {
        const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
        const canvas2 = document.getElementById('myCanvas2') as HTMLCanvasElement;
        const outputCanvas = document.getElementById('outputCanvas') as HTMLCanvasElement;
        const ctx = (canvas.getContext('2d') as CanvasRenderingContext2D);
        const ctx2 = (canvas2.getContext('2d') as CanvasRenderingContext2D);
        const outputCtx = (outputCanvas.getContext('2d') as CanvasRenderingContext2D);
        const brushSizeSlider = document.getElementById('brushSizeSlider') as HTMLInputElement;
        const toggleCanvasButton = document.getElementById('toggleCanvasButton') as HTMLButtonElement;
        const flipColorsButton = document.getElementById('flipColorsButton') as HTMLButtonElement;
        const resetButton = document.getElementById('resetButton') as HTMLButtonElement;
        const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement;
        let img = new Image();
        let isDrawing = false;
        let brushSize = 5; // Initial brush size
        let lastX: number | undefined, lastY: number | undefined;

        // img.src = URL.createObjectURL(this.getVisualProperties('image-input').files[0]);

        img.src = URL.createObjectURL(file);

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
        };

        // Handle mouse events for continuous brush effect
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);

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
            a.download = 'canvas2_paintbrush.png';
            a.click();
        }

        brushSizeSlider.addEventListener('input', brushSizeInputListener);
        resetButton.addEventListener('click', resetButtonClickHandler);
        downloadButton.addEventListener('click', downloadButtonClickHandler);

        // Define the toggle canvas button click handler
        toggleCanvasButton.addEventListener('click', () => {
            if (canvas.style.display === 'none') {
                canvas.style.display = 'block';
                canvas2.style.display = 'none';
            } else {
                canvas.style.display = 'none';
                canvas2.style.display = 'block';
            }
        });

        // Define the flip colors button click handler
        flipColorsButton.addEventListener('click', () => {
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
        });
    };


    const props: UploadProps = {
        name: 'file',
        multiple: false,
        listType: 'picture',
        beforeUpload: (file) => {
            const isPNG = file.type === 'image/png';
            const isJpeg = file.type === 'image/jpeg';
            if (!isPNG && !isJpeg) {
                message.error(`${file.name} is not a png or jpg file`);
                return false;
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target && e.target.result) {
                        setUploadedImageUrl(e.target.result.toString());
                        showEditModal(file);
                    }
                };
                reader.readAsDataURL(file);
                return false;
            }
        },
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return (
        <div>
            <ModeHeader>Generators</ModeHeader>
            <ButtonRow>
                {tagsData.map((tag) => (
                    <StyledCheckableTag
                        key={tag}
                        checked={selectedTags.includes(tag)}
                        onChange={(checked) => handleChange(tag, checked)}
                    >
                        {tag}
                    </StyledCheckableTag>
                ))}
            </ButtonRow>
            <ModeHeader>Image</ModeHeader>
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned
                    files.
                </p>
            </Dragger>
            {uploadedImageUrl && (
                <div style={{ marginTop: '20px', backgroundImage: `url(${uploadedImageUrl})`, backgroundSize: 'cover' }}>
                    {/* You can customize the styles as needed */}
                    <p>Uploaded Image</p>
                </div>
            )}
            <ModeHeader>Mask</ModeHeader>
            <ImageEditor>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <EditorButtonColumn>
                        <div className="modal-editor-divider">
                            <EditButton id="resetButton">Reset Edits</EditButton>
                        </div>
                        <div className="modal-editor-divider">
                            <EditButton id="toggleCanvasButton">Toggle Mask Preview</EditButton>
                        </div>
                        <div className="modal-editor-divider">
                            <EditButton id="flipColorsButton">Flip Mask Output Color</EditButton>
                        </div>
                        <div className="modal-editor-divider">
                            <EditButton id="downloadButton">Download Edits</EditButton>
                        </div>
                        <div className="modal-editor-divider">
                            <label className="modal-editor-title" htmlFor="brushSizeSlider">Brush Size:</label>
                            <ImageEditorSlider type="range" className="modal-editor-slider" id="brushSizeSlider" min="1"
                                               max="20"
                                               step="1" value="5" />
                        </div>
                    </EditorButtonColumn>
                    <div>
                        <canvas id="myCanvas" width="400" height="400" style={{ border: "1px solid #000" }}></canvas>
                        <canvas id="myCanvas2" width="400" height="400"
                                style={{ border: "1px solid #000", display: "none" }}></canvas>
                        <canvas id="outputCanvas" width="400" height="400"
                                style={{ border: "1px solid #000", display: "none" }}></canvas>
                    </div>
                </div>
            </ImageEditor>
        </div>
    );
};

export default SimplifiedInpainting;
