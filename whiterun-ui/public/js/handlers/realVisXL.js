import {operatorHandler, setSelected} from "./operator.js";

export class RealVisXL extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);

        const iDict = {
            "scheduler": "DPMSolverMultistep",
            "guidance_scale": 7,
            "num_inference_steps": 40,
            "disable_safety_checker": false
        }

        this.setInitialData(iDict)
    }

    static async loadUsingDoc(doc, dataDict){
        const sampler = doc.getElementsByClassName("real-vis-txt-to-img-sampler")[0];
        const step = doc.getElementsByClassName("real-vis-txt-to-img-steps")[0];
        const guidance = doc.getElementsByClassName("real-vis-txt-to-img-guidance")[0];
        const seed = doc.getElementsByClassName("real-vis-txt-to-img-seed")[0];
        const disabledFilter = doc.getElementsByClassName("real-vis-txt-to-img-safety")[0];

        setSelected(dataDict["scheduler"], sampler)

        guidance.setAttribute("value", dataDict["guidance_scale"])
        seed.setAttribute("value", dataDict["seed"])
        step.setAttribute("value", dataDict["num_inference_steps"])

        if (dataDict["disable_safety_checker"]){
            disabledFilter.setAttribute("checked", true)
        }

        return doc
    }

    setExecVisualizations() {
        const sampler = this.getVisualProperties("real-vis-txt-to-img-sampler")
        const step = this.getVisualProperties("real-vis-txt-to-img-steps")
        const guidance = this.getVisualProperties("real-vis-txt-to-img-guidance")
        const seed = this.getVisualProperties("real-vis-txt-to-img-seed")
        const disabledFilter = this.getVisualProperties("real-vis-txt-to-img-safety");

        sampler.addEventListener("input", () =>
            this.handleTextChange("scheduler", "real-vis-txt-to-img-sampler"));

        step.addEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-steps", "num_inference_steps"));

        guidance.addEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-guidance", "guidance_scale"));

        seed.addEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-seed", "seed"));

        disabledFilter.addEventListener('change', () => this.updateFilter(
            "real-vis-txt-to-img-safety", "disable_safety_checker"
        ));

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const sampler = this.getVisualProperties("real-vis-txt-to-img-sampler")
        const step = this.getVisualProperties("real-vis-txt-to-img-steps")
        const guidance = this.getVisualProperties("real-vis-txt-to-img-guidance")
        const seed = this.getVisualProperties("real-vis-txt-to-img-seed")
        const disabledFilter = this.getVisualProperties("real-vis-txt-to-img-safety");

        sampler.removeEventListener("input", () =>
            this.handleTextChange("scheduler", "real-vis-txt-to-img-sampler"));

        step.removeEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-steps", "num_inference_steps"));

        guidance.removeEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-guidance", "guidance_scale"));

        seed.removeEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-seed", "seed"));

        disabledFilter.removeEventListener('change', () => this.updateFilter());

        return super.removeExecVisualizations();
    }
}