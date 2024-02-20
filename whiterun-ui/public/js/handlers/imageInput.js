import {operatorHandler} from "./operator.js";
import {requestInterceptor, uploadImage} from "../api.js";
import {fetchHTML} from "../constuctOperator.js";
import {showModal, hideModal} from "../maskModal.js";

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

    static async load(dataDict){
        let html = await fetchHTML("image")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")
        return doc.getElementsByClassName("visualization")[0].outerHTML
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

        const editButton = this.getVisualProperties("edit-button")
        // Disable the edit button initially
        editButton.disabled = true;

        // Add an event listener to enable/disable the edit button based on file selection
        imageButton.addEventListener('change', (event) => {
            editButton.disabled = !(event.target.files && event.target.files[0]);
        });

        editButton.addEventListener('click', () => showModal(this.getVisualProperties('image-input')));

        // Add an event listener to close the modal when the close button (×) is clicked
        const closeButton = document.querySelector('.modal-edit-image-close');
        closeButton.addEventListener('click', () => hideModal());

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const imageButton = this.getVisualProperties("image-input")
        imageButton.removeEventListener('change', this.changeInput)
        return super.removeExecVisualizations();
    }
}