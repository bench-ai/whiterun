export function showModal(imageInput) {
    const modal = document.getElementById('editModal');
    const canvas = document.getElementById('myCanvas');
    const canvas2 = document.getElementById('myCanvas2')
    const outputCanvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    const outputCtx = outputCanvas.getContext('2d');
    const fileInput = document.getElementById('fileInput');
    let img = new Image();
    let isDrawing = false;
    const brushSizeSlider = document.getElementById('brushSizeSlider');
    let brushSize = 5; // Initial brush size
    const toggleCanvasButton = document.getElementById('toggleCanvasButton');
    const flipColorsButton = document.getElementById('flipColorsButton');
    const resetButton = document.getElementById('resetButton');
    const downloadButton = document.getElementById('downloadButton');
    let lastX, lastY;

    // img.src = URL.createObjectURL(this.getVisualProperties('image-input').files[0]);

    img.src = URL.createObjectURL(imageInput.files[0]);
    modal.style.display = 'block';

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

    function startDrawing(event) {
        isDrawing = true;
        draw(event);
    }


    function draw(event) {
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
    toggleCanvasButton.addEventListener('click', toggleCanvasButtonClickHandler);
    flipColorsButton.addEventListener('click', flipColorsButtonClickHandler);

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

    // Add an event listener to clear the drawing when the modal is closed
    const closeButton = document.querySelector('.modal-edit-image-close');
    closeButton.addEventListener('click', () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        brushSizeSlider.removeEventListener('input', brushSizeInputListener);
        resetButton.removeEventListener('click', resetButtonClickHandler);
        downloadButton.removeEventListener('click', downloadButtonClickHandler);
        toggleCanvasButton.removeEventListener('click', toggleCanvasButtonClickHandler);
        flipColorsButton.removeEventListener('click', flipColorsButtonClickHandler);
    });
}

// Add this method to hide the modal
export function hideModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}