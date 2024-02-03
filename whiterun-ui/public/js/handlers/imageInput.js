import {operatorHandler} from "./operator.js";
import {requestInterceptor, uploadImage} from "../api.js";

export class ImageHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
    }

    async changeInput(event){
        if (event.target && event.target.classList.contains('image-input')) {
            const fileInput = event.target;
            const imageElement = fileInput.parentElement.querySelector('.image-op-file');

            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    imageElement.src = e.target.result;
                };

                reader.readAsDataURL(fileInput.files[0]);
            }
        }
    }

    async getOutputObject(inputObject) {

        const fileInput = this.getVisualProperties("image-input")
        const body = await requestInterceptor(uploadImage, fileInput, true)

        return this.checkOutputs({
            "output_1": {
                "type": "image",
                "file_id": body["key"],
                "file":  fileInput.files[0],
                "url": ""
            }
        });
    }

    setExecVisualizations() {
        const imageButton = this.getVisualProperties("image-input")
        imageButton.addEventListener('change', this.changeInput);
        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const imageButton = this.getVisualProperties("image-input")
        imageButton.removeEventListener('change', this.changeInput)
        return super.removeExecVisualizations();
    }
}